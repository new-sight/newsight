import os
import requests
import json
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()


class NewsExtractor:
    def __init__(
        self, api_url: str = None, api_key: str = None, model_name: str = None
    ):
        """
        AI 번역, 요약 및 태그/관계 추출기 초기화.
        """
        self.api_url = (
            api_url or os.getenv("OLLAMA_API_URL", "https://api.ollama.com")
        ).rstrip("/")
        self.api_key = api_key or os.getenv("OLLAMA_API_KEY", "")
        self.model_name = model_name or os.getenv("OLLAMA_MODEL_NAME", "gemma4:31b")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        print(
            f"[Extractor] Initialized with Ollama Cloud API: {self.api_url}, Model: {self.model_name}"
        )

    def extract_metadata(self, title: str, content: str) -> Dict[str, Any]:
        """
        Gemma 4를 사용하여 뉴스를 분석하고 한국어 번역 제목, 요약, 태그, 관계 정보를 JSON으로 추출합니다.
        """
        prompt = (
            "[System: Analyze news and return ONLY a valid JSON object matching the requested schema. No conversational text.]\n\n"
            "요구사항:\n"
            "1. translatedTitle: 외국어 기사 제목은 자연스러운 한국어로 번역 (한국어면 원본 유지)\n"
            "2. summary: 기사 내용을 반영한 한 줄 한국어 요약\n"
            "3. sentimentScore: 주식/기업가치 영향도 (-1.0:악재 ~ 1.0:호재, 중립:0.0)\n"
            "4. tags: 고유명사/기술명 태그. name과 master는 모두 친숙한 한글 명칭으로 변환 (예: Apple->애플, Tesla->테슬라)\n"
            "5. relations: 기업 간 관계 추출 (type: SUBSIDIARY_OF | SUPPLIES_TO | PARTNER_WITH | COMPETE_WITH | RELATED_TO)\n\n"
            "{\n"
            '  "translatedTitle": "한국어 제목",\n'
            '  "summary": "한 줄 요약",\n'
            '  "sentimentScore": 0.0,\n'
            '  "tags": [{"name": "태그명", "master": "표준한글명"}],\n'
            '  "relations": [{"source": "A사", "target": "B사", "type": "RELATED_TO"}]\n'
            "}\n\n"
            f"[기사 제목]: {title}\n"
            f"[기사 본문]: {content}"
        )

        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "format": "json",
        }

        try:
            url = f"{self.api_url}/api/chat"
            print(f"[Extractor] Requesting metadata extraction for: '{title[:30]}...'")
            response = requests.post(
                url, json=payload, headers=self.headers, timeout=120
            )

            if response.status_code == 200:
                resp_json = response.json()
                message_content = resp_json["message"]["content"].strip()

                # 마크다운 코드 블록 정제
                if message_content.startswith("```"):
                    first_newline = message_content.find("\n")
                    if first_newline != -1:
                        message_content = message_content[first_newline + 1 :]
                    else:
                        message_content = message_content[3:]
                    if message_content.endswith("```"):
                        message_content = message_content[:-3]
                    message_content = message_content.strip()

                parsed_result = json.loads(message_content)
                return parsed_result
            else:
                print(
                    f"[Extractor] Error calling LLM API. Status code: {response.status_code}, Body: {response.text}"
                )
        except Exception as e:
            print(f"[Extractor] Exception during metadata extraction: {e}")

        # 에러 발생 시 Fallback 데이터 리턴
        return {
            "translatedTitle": title,
            "summary": "요약 및 분석 실패 (Gemma 4 API 에러)",
            "sentimentScore": 0.0,
            "tags": [],
            "relations": [],
        }


if __name__ == "__main__":
    # 로컬 테스트용
    extractor = NewsExtractor()
    sample_title = "Apple announces Apple Intelligence at WWDC 2024"
    sample_content = "Apple has officially announced Apple Intelligence, a personal intelligence system for iPhone, iPad, and Mac that combines generative models with personal context to deliver useful features. WWDC also featured new updates to iOS, macOS, and Siri powered by ChatGPT integrations."

    result = extractor.extract_metadata(sample_title, sample_content)
    print("\n--- Extraction Result ---")
    print(json.dumps(result, indent=2, ensure_ascii=False))
