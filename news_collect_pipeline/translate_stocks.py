import os
import sys
import json
import time
import requests
from dotenv import load_dotenv
from neo4j import GraphDatabase

# 1. 환경 변수 로드 (로컬/서버 대응)
env_path = "news_collect_pipeline/.env"
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "https://api.ollama.com")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "gemma4:31b")


def fetch_stocks_to_translate(driver):
    """
    한글명(kor_name)이 아직 한글 문자를 포함하지 않는(영어/숫자 등) Stock 노드를 조회합니다.
    """
    query = """
    MATCH (s:Stock)
    WHERE s.kor_name IS NULL OR NOT s.kor_name =~ '.*[ㄱ-ㅎㅏ-ㅣ가-힣].*'
    RETURN s.ticker AS ticker, s.name AS name
    """
    with driver.session() as session:
        result = session.run(query)
        return [{"ticker": record["ticker"], "name": record["name"]} for record in result]


def translate_batch_with_llm(batch):
    """
    200개의 주식 데이터를 Ollama Gemma 4를 통해 한글 사명으로 일괄 번역합니다.
    """
    prompt = f"""You are a financial translation expert. Translate these English company names into their widely recognized, standard Korean official names.
For example:
- Apple Inc -> 애플
- NVIDIA Corp -> 엔비디아
- Microsoft Corporation -> 마이크로소프트
- Tesla Inc -> 테슬라
- Taiwan Semiconductor Manufacturing Co Ltd -> TSMC
- ASML Holding NV -> ASML
- Toyota Motor Corp -> 도요타

Translate each of the following companies. Keep the ticker exactly the same. If the name is already Korean, or cannot be translated, just return the name.

Companies to translate:
{json.dumps(batch, ensure_ascii=False, indent=2)}

You MUST respond ONLY with a valid JSON object matching this schema:
{{
  "translations": [
    {{"ticker": "ticker_symbol", "kor_name": "translated_korean_name"}}
  ]
}}
Do not include any conversational text or markdown code blocks. Return only raw JSON.
"""
    
    url = f"{OLLAMA_API_URL.rstrip('/')}/api/chat"
    headers = {
        "Authorization": f"Bearer {OLLAMA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "format": "json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=180)
        if response.status_code == 200:
            resp_json = response.json()
            message_content = resp_json["message"]["content"].strip()
            
            # Markdown block formatting cleanup
            if message_content.startswith("```"):
                first_newline = message_content.find("\n")
                if first_newline != -1:
                    message_content = message_content[first_newline+1:]
                else:
                    message_content = message_content[3:]
                if message_content.endswith("```"):
                    message_content = message_content[:-3]
            
            parsed_result = json.loads(message_content.strip())
            return parsed_result.get("translations", [])
        else:
            print(f"[Ollama Error] HTTP Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        print(f"[Ollama Error] Exception occurred: {e}")
    
    return []


def update_stocks_in_neo4j(driver, translations):
    """
    번역된 한글명을 Neo4j에 벌크로 업데이트합니다.
    """
    query = """
    UNWIND $batch AS row
    MATCH (s:Stock {ticker: row.ticker})
    SET s.kor_name = row.kor_name
    """
    with driver.session() as session:
        try:
            session.run(query, batch=translations)
            return True
        except Exception as e:
            print(f"[Neo4j Error] Failed to update batch: {e}")
            return False


def main():
    print("==================================================")
    print("[Batch Translation] Neo4j 주식 노드 한글 번역 배치 작업 시작")
    print(f"Neo4j 연결 대상: {NEO4J_URI}")
    print(f"Ollama 모델: {OLLAMA_MODEL_NAME}")
    print("==================================================")

    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    try:
        driver.verify_connectivity()
        print("[Neo4j] 연결 확인 완료.")
        
        # 1. 번역할 대상 추출
        stocks_to_translate = fetch_stocks_to_translate(driver)
        total_count = len(stocks_to_translate)
        print(f"[Info] 번역이 필요한 주식 개수: {total_count}개")
        
        if total_count == 0:
            print("[Info] 번역 대상 주식이 없습니다. 작업을 종료합니다.")
            return

        # 2. 200개씩 배치 처리
        batch_size = 200
        for i in range(0, total_count, batch_size):
            chunk = stocks_to_translate[i : i + batch_size]
            print(f"\n[진행률] {i}/{total_count} 처리 중... (현재 배치 크기: {len(chunk)})")
            
            # LLM API를 통한 번역 수행
            translations = translate_batch_with_llm(chunk)
            
            if not translations:
                print("[Warn] 번역 결과를 받지 못해 다음 배치로 건너뜁니다.")
                continue
            
            # Neo4j 업데이트
            success = update_stocks_in_neo4j(driver, translations)
            if success:
                print(f"[Success] {len(translations)}개 주식 한글명 업데이트 완료.")
            
            # API 레이트 리밋 방지를 위한 딜레이
            time.sleep(1)

        print("\n==================================================")
        print("[Batch Translation] 모든 배치 번역 및 업데이트 작업이 종료되었습니다.")
        print("==================================================")
        
    except Exception as e:
        print(f"[Critical Error] {e}")
    finally:
        driver.close()


if __name__ == "__main__":
    main()
