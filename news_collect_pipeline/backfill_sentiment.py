import os
import requests
import json
import pg8000.dbapi
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

def extract_sentiment_only(title, summary, api_url, api_key, model_name, headers):
    """
    Ollama LLM을 사용하여 기사 제목과 요약에 대한 감성 점수만 빠르게 추출합니다.
    """
    prompt = (
        "[System: You are an expert financial sentiment analyzer. Analyze the news and return ONLY a valid JSON object matching the requested schema. No conversational text.]\n\n"
        "다음 뉴스 기사 제목과 요약을 분석해서, 이 기사가 주식 시장이나 기업 가치에 미치는 전체적인 영향(호재/악재)을 감성 점수로 평가해줘.\n"
        "감성 점수는 -1.0(매우 부정/악재)에서 1.0(매우 긍정/호재) 사이의 실수값(Float)이어야 해. 중립적인 내용이라면 0.0을 반환해줘.\n"
        "오직 아래 포맷의 JSON 데이터 하나만 출력해줘. 다른 텍스트는 절대 포함하지 마:\n"
        "{\n"
        "  \"sentimentScore\": 0.5\n"
        "}\n\n"
        f"[뉴스 제목]: {title}\n"
        f"[뉴스 요약]: {summary}"
    )

    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "format": "json"
    }

    try:
        url = f"{api_url}/api/chat"
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            resp_json = response.json()
            message_content = resp_json["message"]["content"].strip()
            
            # 마크다운 코드 블록 정제
            if message_content.startswith("```"):
                first_newline = message_content.find('\n')
                if first_newline != -1:
                    message_content = message_content[first_newline+1:]
                else:
                    message_content = message_content[3:]
                if message_content.endswith("```"):
                    message_content = message_content[:-3]
                message_content = message_content.strip()

            parsed = json.loads(message_content)
            score = parsed.get("sentimentScore")
            if score is not None:
                return float(score)
    except Exception as e:
        print(f"[LLM Error] Failed to analyze sentiment for '{title[:20]}...': {e}")
        
    return 0.0

def backfill():
    # 1. 커넥션 파라미터 정보
    supabase_params = {
        "host": os.getenv("SUPABASE_DB_HOST", "db.your-project-id.supabase.co"),
        "port": int(os.getenv("SUPABASE_DB_PORT", 5432)),
        "user": os.getenv("SUPABASE_DB_USER", "postgres"),
        "password": os.getenv("SUPABASE_DB_PASSWORD", ""),
        "database": os.getenv("SUPABASE_DB_NAME", "postgres"),
        "ssl_context": True,
    }

    neo4j_uri = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "")

    # LLM 설정
    api_url = (os.getenv("OLLAMA_API_URL", "https://api.ollama.com")).rstrip("/")
    api_key = os.getenv("OLLAMA_API_KEY", "")
    model_name = os.getenv("OLLAMA_MODEL_NAME", "gemma4:31b")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    supabase_conn = None
    supabase_cursor = None
    neo4j_driver = None

    try:
        # 2. Supabase 연결 및 감성 점수가 없는 뉴스 조회
        print("[Backfill] Connecting to Supabase...")
        supabase_conn = pg8000.dbapi.connect(**supabase_params)
        supabase_cursor = supabase_conn.cursor()

        # sentiment_score 컬럼이 없는 경우에 대비하여 ALTER TABLE 선행 실행
        alter_query = "ALTER TABLE news ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC;"
        supabase_cursor.execute(alter_query)
        supabase_conn.commit()

        # 3. Neo4j 연결
        print("[Backfill] Connecting to Neo4j...")
        neo4j_driver = GraphDatabase.driver(
            neo4j_uri,
            auth=(neo4j_user, neo4j_password),
            max_connection_lifetime=300
        )
        neo4j_driver.verify_connectivity()
        print("[Backfill] Neo4j connected successfully.")

        update_neo4j_query = """
        MATCH (n:News {id: $id})
        SET n.sentimentScore = $sentimentScore;
        """

        # 4. 단계 1: Supabase에는 감성 점수가 있으나 Neo4j에 누락되었을 수 있는 데이터 동기화
        print("[Backfill] Step 1: Syncing existing sentiment_scores from Supabase to Neo4j...")
        select_existing_query = """
        SELECT id, sentiment_score 
        FROM news 
        WHERE sentiment_score IS NOT NULL;
        """
        supabase_cursor.execute(select_existing_query)
        existing_news = supabase_cursor.fetchall()
        total_existing = len(existing_news)
        print(f"[Backfill] Found {total_existing} news articles with existing scores in Supabase.")

        if total_existing > 0:
            print("[Backfill] Synchronizing existing scores to Neo4j...")
            with neo4j_driver.session() as session:
                for idx, row in enumerate(existing_news):
                    news_id = row[0]
                    score = float(row[1])
                    try:
                        session.run(update_neo4j_query, id=news_id, sentimentScore=score)
                    except Exception as ne:
                        print(f"[Graph Error] Failed to sync Neo4j for ID {news_id}: {ne}")
            print("[Backfill] Neo4j synchronization completed.")

        # 5. 단계 2: 감성 점수가 완전히 누락된(NULL) 뉴스 조회 및 LLM 분석/적재
        print("[Backfill] Step 2: Finding news articles with missing sentiment scores in Supabase...")
        select_unprocessed_query = """
        SELECT id, title, summary 
        FROM news 
        WHERE sentiment_score IS NULL;
        """
        supabase_cursor.execute(select_unprocessed_query)
        unprocessed_news = supabase_cursor.fetchall()
        total_unprocessed = len(unprocessed_news)
        print(f"[Backfill] Found {total_unprocessed} news articles with missing sentiment scores in Supabase.")

        if total_unprocessed > 0:
            update_supabase_query = """
            UPDATE news 
            SET sentiment_score = %s 
            WHERE id = %s;
            """
            
            print("[Backfill] Starting LLM analysis for missing scores...")
            with neo4j_driver.session() as session:
                for index, item in enumerate(unprocessed_news):
                    news_id = item[0]
                    title = item[1]
                    summary = item[2] or ""

                    # LLM 감성 분석 호출
                    score = extract_sentiment_only(title, summary, api_url, api_key, model_name, headers)
                    print(f"[Backfill] [{index + 1}/{total_unprocessed}] Title: '{title[:30]}...' -> Sentiment Score: {score}")

                    # Supabase 업데이트
                    try:
                        supabase_cursor.execute(update_supabase_query, (score, news_id))
                        supabase_conn.commit()
                    except Exception as se:
                        print(f"[DB Error] Failed to update Supabase for ID {news_id}: {se}")
                        supabase_conn.rollback()

                    # Neo4j 업데이트
                    try:
                        session.run(update_neo4j_query, id=news_id, sentimentScore=score)
                    except Exception as ne:
                        print(f"[Graph Error] Failed to update Neo4j for ID {news_id}: {ne}")

            print(f"[Backfill] LLM analysis and backfill completed. Total processed: {total_unprocessed}")
        else:
            print("[Backfill] No news articles with missing sentiment scores found.")

    except Exception as e:
        print(f"[Backfill] Migration failed with exception: {e}")
    finally:
        # 6. 안전한 자원 해제
        print("[Backfill] Closing resources...")
        if supabase_cursor:
            try:
                supabase_cursor.close()
            except Exception:
                pass
        if supabase_conn:
            try:
                supabase_conn.close()
                print("[Backfill] Supabase PostgreSQL connection closed.")
            except Exception:
                pass
        if neo4j_driver:
            try:
                neo4j_driver.close()
                print("[Backfill] Neo4j driver closed.")
            except Exception:
                pass

if __name__ == "__main__":
    backfill()
