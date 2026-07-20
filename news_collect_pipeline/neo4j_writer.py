import os
from neo4j import GraphDatabase
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class Neo4jWriter:
    def __init__(self, uri: str = None, user: str = None, password: str = None):
        """
        Neo4j 드라이버 초기화 및 데이터베이스 연결.
        """
        uri = uri or os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
        user = user or os.getenv("NEO4J_USER", "neo4j")
        password = password or os.getenv("NEO4J_PASSWORD", "")

        # AuraDB 권장 설정 (Idle connection 해제 주기 설정)
        self.driver = GraphDatabase.driver(
            uri, auth=(user, password), max_connection_lifetime=300
        )
        # 즉시 연결 상태 테스트 (Fail-Fast)
        try:
            self.driver.verify_connectivity()
            print(f"[Neo4jWriter] Driver initialized and verified connection for {uri}")
        except Exception as e:
            print(f"[Neo4jWriter] Failed to verify connectivity to {uri}: {e}")
            raise e

    def close(self):
        self.driver.close()

    def save_news_ontology(
        self,
        news_id: str,
        title: str,
        summary: str,
        link: str,
        tags: List[Dict[str, str]],
        relations: List[Dict[str, str]],
        sentiment_score: float = None,
        lang_code: str = None,
        country: str = None,
        category: str = None,
        source: str = None,
    ) -> bool:
        """
        뉴스 및 관련 온톨로지 정보를 Neo4j 지식 그래프에 저장하고, 공통 태그 기사 링크를 연결합니다.
        """
        with self.driver.session() as session:
            try:
                # 1. News 노드 생성/업데이트
                session.execute_write(
                    self._create_news_node,
                    news_id,
                    title,
                    summary,
                    link,
                    sentiment_score,
                    lang_code,
                    country,
                    category,
                    source,
                )

                # 2. 태그 노드 및 HAS_TAG 관계 생성
                # 대소문자 구분을 무력화하여 일관성 있는 그래프 구축
                master_tags_in_news = set()
                for tag_info in tags:
                    name = tag_info.get("name", "").strip()
                    master = tag_info.get("master", "").strip()

                    if not name:
                        continue
                    if not master:
                        master = name

                    # 주식 마스터 데이터와 연계 체크 (티커 또는 이름 기준)
                    matched_stock_name = session.execute_read(
                        self._lookup_stock_name, name, master
                    )
                    if matched_stock_name:
                        master = matched_stock_name

                    # 마스터 태그 생성 및 동의어 처리
                    session.execute_write(self._create_tag_and_synonyms, name, master)
                    master_tags_in_news.add(master)

                    # 뉴스를 표준화된 마스터 태그와 연관시킴
                    session.execute_write(
                        self._create_has_tag_relation, news_id, master
                    )

                # 3. 태그 간 비즈니스 관계 생성
                for rel in relations:
                    source = rel.get("source", "").strip()
                    target = rel.get("target", "").strip()
                    rel_type = rel.get("type", "").strip().upper()
                    if not source or not target:
                        continue

                    # 지원하는 관계 유형만 매핑, 기본값은 RELATED_TO
                    if rel_type not in [
                        "SUBSIDIARY_OF",
                        "SUPPLIES_TO",
                        "PARTNER_WITH",
                        "COMPETE_WITH",
                        "RELATED_TO",
                    ]:
                        rel_type = "RELATED_TO"

                    session.execute_write(
                        self._create_specific_relation, source, target, rel_type
                    )

                # 4. 공통 마스터 태그 기반 연계망(RELATED_NEWS) 자동 링킹
                session.execute_write(self._connect_related_news, news_id)
                print(
                    f"[Neo4jWriter] Successfully saved ontology for news ID: {news_id}"
                )
                return True

            except Exception as e:
                print(f"[Neo4jWriter] Failed to save news ontology: {e}")
                return False

    @staticmethod
    def _create_news_node(
        tx,
        news_id: str,
        title: str,
        summary: str,
        link: str,
        sentiment_score: float = None,
        lang_code: str = None,
        country: str = None,
        category: str = None,
        source: str = None,
    ):
        query = """
        MERGE (n:News {id: $id})
        SET n.title = $title,
            n.summary = $summary,
            n.link = $link,
            n.sentimentScore = $sentimentScore,
            n.lang_code = $langCode,
            n.langCode = $langCode,
            n.country = $country,
            n.category = $category,
            n.source = $source,
            n.createdAt = datetime($createdAt)
        """
        # ISO 형식으로 변환하여 Neo4j datetime으로 처리
        created_at_iso = datetime.now().isoformat()
        tx.run(
            query,
            id=news_id,
            title=title,
            summary=summary,
            link=link,
            sentimentScore=sentiment_score,
            langCode=lang_code,
            country=country,
            category=category,
            source=source,
            createdAt=created_at_iso,
        )

    @staticmethod
    def _lookup_stock_name(tx, name: str, master: str) -> str:
        query = """
        MATCH (s:Stock)
        WHERE s.name = $name OR s.name = $master
           OR s.kor_name = $name OR s.kor_name = $master
           OR s.ticker = $name OR s.ticker = $master
           OR (s.ticker IS NOT NULL AND s.ticker CONTAINS '.' AND (
               $name = split(s.ticker, '.')[0] OR $master = split(s.ticker, '.')[0]
               OR (size($name) > 3 AND $name CONTAINS split(s.ticker, '.')[0])
               OR (size($master) > 3 AND $master CONTAINS split(s.ticker, '.')[0])
           ))
        RETURN s.name AS stockName, s.kor_name AS stockKorName, s.ticker AS ticker
        LIMIT 1
        """
        result = tx.run(query, name=name, master=master)
        record = result.single()
        if not record:
            return None
        
        stock_name = record["stockName"]
        stock_kor_name = record.get("stockKorName")
        ticker = record["ticker"]
        
        # tag의 name이 한글이고 s.kor_name이 아직 한글이 아니거나 영어 사명과 같은 경우 업데이트 진행
        import re
        has_korean = lambda s: bool(re.search('[ㄱ-ㅎㅏ-ㅣ가-힣]', s)) if s else False
        
        if has_korean(name) and (not stock_kor_name or not has_korean(stock_kor_name) or stock_kor_name == stock_name):
            update_query = """
            MATCH (s:Stock {ticker: $ticker})
            SET s.kor_name = $kor_name
            """
            tx.run(update_query, ticker=ticker, kor_name=name)
            stock_kor_name = name
            print(f"[Neo4jWriter] Dynamically updated Stock '{ticker}' kor_name to '{name}'")
            
        return stock_kor_name if stock_kor_name else stock_name

    @staticmethod
    def _create_tag_and_synonyms(tx, name: str, master: str):
        # 마스터 태그 생성
        query_master = """
        MERGE (m:Tag {name: $masterName})
        ON CREATE SET m.isMaster = true
        """
        tx.run(query_master, masterName=master)

        # 동의어 명칭과 마스터가 다른 경우 동의어 노드 생성 및 관계 매핑
        if name.lower() != master.lower():
            query_synonym = """
            MERGE (m:Tag {name: $masterName})
            MERGE (s:Tag {name: $synonymName})
            ON CREATE SET s.isMaster = false
            MERGE (s)-[:SYNONYM_OF]->(m)
            """
            tx.run(query_synonym, masterName=master, synonymName=name)

    @staticmethod
    def _create_has_tag_relation(tx, news_id: str, master_tag_name: str):
        query = """
        MATCH (n:News {id: $newsId})
        MATCH (t:Tag {name: $masterTagName})
        MERGE (n)-[:HAS_TAG]->(t)
        """
        tx.run(query, newsId=news_id, masterTagName=master_tag_name)

    @staticmethod
    def _create_specific_relation(tx, source: str, target: str, rel_type: str):
        # s와 t 노드를 먼저 생성/매칭
        query_nodes = """
        MERGE (s:Tag {name: $source})
        ON CREATE SET s.isMaster = true
        MERGE (t:Tag {name: $target})
        ON CREATE SET t.isMaster = true
        """
        tx.run(query_nodes, source=source, target=target)

        # 관계 타입에 맞추어 생성
        if rel_type == "SUBSIDIARY_OF":
            query_rel = "MATCH (s:Tag {name: $source}), (t:Tag {name: $target}) MERGE (s)-[:SUBSIDIARY_OF]->(t)"
        elif rel_type == "SUPPLIES_TO":
            query_rel = "MATCH (s:Tag {name: $source}), (t:Tag {name: $target}) MERGE (s)-[:SUPPLIES_TO]->(t)"
        elif rel_type == "PARTNER_WITH":
            query_rel = "MATCH (s:Tag {name: $source}), (t:Tag {name: $target}) MERGE (s)-[:PARTNER_WITH]->(t) MERGE (t)-[:PARTNER_WITH]->(s)"
        elif rel_type == "COMPETE_WITH":
            query_rel = "MATCH (s:Tag {name: $source}), (t:Tag {name: $target}) MERGE (s)-[:COMPETE_WITH]->(t) MERGE (t)-[:COMPETE_WITH]->(s)"
        else:
            query_rel = "MATCH (s:Tag {name: $source}), (t:Tag {name: $target}) MERGE (s)-[:RELATED_TO]->(t) MERGE (t)-[:RELATED_TO]->(s)"

        tx.run(query_rel, source=source, target=target)

    @staticmethod
    def _connect_related_news(tx, new_news_id: str):
        query = """
        MATCH (newNews:News {id: $newNewsId})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(existingNews:News)
        WHERE newNews <> existingNews
        WITH existingNews, newNews, count(t) as commonCount
        WHERE commonCount >= 1
        MERGE (newNews)-[:RELATED_NEWS]->(existingNews)
        MERGE (existingNews)-[:RELATED_NEWS]->(newNews)
        """
        tx.run(query, newNewsId=new_news_id)


if __name__ == "__main__":
    # 로컬 테스트용
    import uuid

    writer = Neo4jWriter()
    try:
        test_id = str(uuid.uuid4())
        test_tags = [
            {"name": "Apple Pro", "master": "애플"},
            {"name": "M4 Ultra", "master": "M4 울트라"},
        ]
        test_rels = [{"source": "애플", "target": "M4 울트라"}]

        success = writer.save_news_ontology(
            news_id=test_id,
            title="애플 초고성능 자체 칩 출시 임박",
            summary="애플이 차세대 M4 울트라 칩을 장착한 PC를 하반기에 전격 내놓습니다.",
            link="https://apple.com/m4",
            tags=test_tags,
            relations=test_rels,
        )
        print(f"Ontology Save Status: {success}")
    finally:
        writer.close()
