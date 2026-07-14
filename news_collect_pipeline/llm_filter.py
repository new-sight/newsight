import os
import requests
import json
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

class NewsLLMFilter:
    def __init__(self, 
                 api_url: str = None, 
                 api_key: str = None,
                 model_name: str = None):
        """
        Gemma 4 기반의 지능형 중복 뉴스 필터링 모듈 초기화.
        """
        self.api_url = (api_url or os.getenv("OLLAMA_API_URL", "https://api.ollama.com")).rstrip("/")
        self.api_key = api_key or os.getenv("OLLAMA_API_KEY", "")
        self.model_name = model_name or os.getenv("OLLAMA_MODEL_NAME", "gemma4:31b")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        print(f"[LLMFilter] Initialized with Ollama Cloud API: {self.api_url}, Model: {self.model_name}")

    def filter_similar_news(self, news_items: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        수집된 뉴스 목록 중에서 내용이 거의 동일하거나 중복된 뉴스를 LLM(Gemma 4)을 사용하여 제거하고,
        고유하고 대표성 있는 기사만 골라내어 반환합니다.
        """
        if not news_items:
            return []
        if len(news_items) == 1:
            return news_items

        # LLM에 전달할 뉴스 리스트를 텍스트 포맷으로 구성
        news_list_str = ""
        for idx, item in enumerate(news_items):
            title = item.get("title", "")
            summary = item.get("summary", "")
            news_list_str += f"[{idx}] 제목: {title}\n    요약: {summary}\n\n"

        prompt = (
            "[System: You are an advanced AI News Editor. Your task is to identify duplicate or highly similar news articles in the provided list and output only the indices of unique, representative articles. Output ONLY valid JSON in the requested format, no markdown, no explanation.]\n\n"
            "다음 제공되는 뉴스 기사 목록을 정밀하게 분석하여, 동일한 사건/소식이나 거의 유사한 주제를 다루고 있어 중복이라고 판단되는 기사를 필터링해 주세요.\n"
            "여러 언론사에서 다룬 유사한 기사가 있다면, 그 중 핵심 내용을 가장 명확하고 정확하게 담고 있는 기사 단 1개만 고유한 기사(대표 기사)로 남겨 주십시오.\n"
            "최종적으로 살아남은 고유 기사들의 '인덱스 번호'만을 아래 JSON 포맷에 맞게 정수 배열 형태로 응답해 주십시오. 순서는 유지하십시오.\n\n"
            "{\n"
            "  \"unique_indices\": [0, 2, 3, 5]\n"
            "}\n\n"
            "## 분석 대상 뉴스 목록:\n"
            f"{news_list_str}"
        )

        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "format": "json"
        }

        try:
            url = f"{self.api_url}/api/chat"
            print(f"[LLMFilter] Sending duplicate filtering request to Gemma 4 for {len(news_items)} items...")
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                resp_json = response.json()
                message_content = resp_json["message"]["content"].strip()
                
                # 마크다운 코드 블록(```json ... ```) 등 불필요 기호가 섞였을 경우 제거
                if message_content.startswith("```"):
                    first_newline = message_content.find('\n')
                    if first_newline != -1:
                        message_content = message_content[first_newline+1:]
                    else:
                        message_content = message_content[3:]
                    if message_content.endswith("```"):
                        message_content = message_content[:-3]
                    message_content = message_content.strip()

                result = json.loads(message_content)
                unique_indices = result.get("unique_indices", [])
                
                # 정상 범주 내 인덱스만 추출
                filtered_news = [news_items[i] for i in unique_indices if 0 <= i < len(news_items)]
                print(f"[LLMFilter] Deduplication completed: {len(news_items)} -> {len(filtered_news)} items")
                return filtered_news
            else:
                print(f"[LLMFilter] Error calling LLM API. Status code: {response.status_code}, Body: {response.text}")
        except Exception as e:
            print(f"[LLMFilter] Exception during LLM filtering: {e}")

        # 통신 장애 등 예외 발생 시에는 안전 장치로 전체 뉴스 목록을 그대로 유지하여 반환
        print("[LLMFilter] Failed to filter similar news. Returning original list.")
        return news_items

if __name__ == "__main__":
    # 로컬 단위 테스트용 기사 예시
    test_news = [
        {
            "title": "삼성전자, 광주에 대규모 반도체 첨단 단지 400조 투자 발표",
            "summary": "삼성전자가 광주광역시에 대규모 반도체 연구 및 생산 시설 단지를 건설하겠다고 전격 공표했습니다."
        },
        {
            "title": "이재용 삼성 회장 광주 방문... '광주에 반도체 신공장 설립 검토'",
            "summary": "이재용 삼성전자 회장이 광주를 전격 방문하여, 첨단 반도체 부지 개발에 대한 투자 의향을 밝혔습니다."
        },
        {
            "title": "애플, WWDC 2026에서 차세대 아이폰18 및 신기능 대거 공개 예정",
            "summary": "애플이 개발자 콘퍼런스를 개최하고 인공지능이 탑재된 iOS 시스템과 하드웨어를 발표할 예정입니다."
        }
    ]
    
    filtrator = NewsLLMFilter()
    filtered = filtrator.filter_similar_news(test_news)
    print("\n--- Filtered Results ---")
    for idx, item in enumerate(filtered):
        print(f"[{idx + 1}] {item['title']}")
