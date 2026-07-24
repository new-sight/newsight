import sys
import uuid
from scraper import GoogleNewsScraper
from extractor import NewsExtractor
from supabase_writer import SupabaseWriter
from neo4j_writer import Neo4jWriter


def main():
    print("==================================================")
    print("[Main] 뉴스 수집 및 AI 온톨로지 저장 파이프라인 통합 가동")
    print("==================================================")

    # 1. 컴포넌트 초기화
    scraper = GoogleNewsScraper()
    extractor = NewsExtractor()

    # 데이터베이스 작성을 위한 커넥터 인스턴스화
    sb_writer = SupabaseWriter()
    neo_writer = Neo4jWriter()

    # 테스트를 위한 국가 및 카테고리 선정 (시간 단축을 위해 KOREA TECHNOLOGY 카테고리만 먼저 진행)
    target_countries = ["KOREA"]
    categories = ["TECHNOLOGY"]

    try:
        for country in target_countries:
            for category in categories:
                print(f"\n[파이프라인] 수집 개시 -> {country} - {category}")

                # 1) 뉴스 피드에서 상위 5개 기사 수집 (테스트 속도 조절을 위해 5개로 제한)
                raw_news = scraper.fetch_news(country, category, limit=5)
                if not raw_news:
                    print(
                        f"[파이프라인] 수집된 뉴스가 없습니다. ({country} - {category})"
                    )
                    continue

                unique_news = raw_news

                # 3) 각 고유 뉴스에 대해 상세 요약, 번역 및 온톨로지 정보 추출
                for idx, news_item in enumerate(unique_news):
                    # URL 기반 고유 UUID 생성 및 존재 여부 체크
                    news_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, news_item["link"]))
                    if sb_writer.exists_news(news_uuid):
                        print(f"[파이프라인] 이미 저장된 뉴스이므로 건너뜀 (ID: {news_uuid}, 제목: {news_item['title']})")
                        continue

                    print(f"\n--- [처리 중 {idx+1}/{len(unique_news)}] ---")
                    print(f"원본 제목: {news_item['title']}")

                    # LLM 기반 AI 분석 요청
                    gemma_result = extractor.extract_metadata(
                        title=news_item["title"], content=news_item["summary"]
                    )

                    # 추출이 실패했거나 더미 데이터가 넘어왔을 경우 스킵 방지용 Fallback 처리
                    translated_title = (
                        gemma_result.get("translatedTitle") or news_item["title"]
                    )
                    summary = gemma_result.get("summary") or "요약본 생성 불가"
                    sentiment_score = gemma_result.get("sentimentScore")
                    if sentiment_score is not None:
                        sentiment_score = float(sentiment_score)
                    else:
                        sentiment_score = 0.0
                    extracted_tags = gemma_result.get("tags") or []
                    extracted_relations = gemma_result.get("relations") or []

                    # 5) Supabase 저장
                    sb_success = sb_writer.insert_news(
                        news_id=news_uuid,
                        title=translated_title,
                        original_title=news_item["title"],
                        summary=summary,
                        link=news_item["link"],
                        tags=extracted_tags,
                        pub_date=news_item.get("pubDate"),
                        sentiment_score=sentiment_score,
                        country=country,
                        category=category,
                        source=news_item.get("source"),
                    )

                    # 6) Neo4j 저장
                    if sb_success:
                        lang_code = {"KOREA": "ko", "CHINA": "zh", "USA": "en", "JAPAN": "ja", "UK": "en"}.get(news_item.get("country", "KOREA").upper(), "en")
                        neo_success = neo_writer.save_news_ontology(
                            news_id=news_uuid,
                            title=translated_title,
                            summary=summary,
                            link=news_item["link"],
                            tags=extracted_tags,
                            relations=extracted_relations,
                            sentiment_score=sentiment_score,
                            lang_code=lang_code,
                            country=country,
                            category=category,
                            source=news_item.get("source"),
                        )
                        if neo_success:
                            print(
                                f"[파이프라인] Supabase & Neo4j 저장 완료 (ID: {news_uuid})"
                            )
                        else:
                            print(
                                f"[파이프라인] WARNING: Supabase는 저장되었으나 Neo4j 온톨로지 저장 실패 (ID: {news_uuid})"
                            )
                    else:
                        print(
                            f"[파이프라인] ERROR: Supabase 메타데이터 저장 실패로 인해 Neo4j 저장 생략"
                        )

    except Exception as e:
        print(f"[파이프라인] 오류 발생: {e}")
    finally:
        neo_writer.close()
        print("\n==================================================")
        print("[Main] 파이프라인 수행 종료 및 자원 반환 완료")
        print("==================================================")


if __name__ == "__main__":
    main()
