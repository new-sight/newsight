import os
import requests
import json
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class NewsExtractor:
    def __init__(self, 
                 api_url: str = None, 
                 api_key: str = None,
                 model_name: str = None):
        """
        AI 번역, 요약 및 태그/관계 추출기 초기화.
        """
        self.api_url = (api_url or os.getenv("OLLAMA_API_URL", "https://api.ollama.com")).rstrip("/")
        self.api_key = api_key or os.getenv("OLLAMA_API_KEY", "")
        self.model_name = model_name or os.getenv("OLLAMA_MODEL_NAME", "gemma4:31b")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        print(f"[Extractor] Initialized with Ollama Cloud API: {self.api_url}, Model: {self.model_name}")

    def extract_metadata(self, title: str, content: str) -> Dict[str, Any]:
        """
        Gemma 4를 사용하여 뉴스를 분석하고 한국어 번역 제목, 요약, 태그, 관계 정보를 JSON으로 추출합니다.
        """
        prompt = (
            "[System: You are an expert News Ontology Agent. Analyze the article and return ONLY a valid JSON object matching the requested schema. No conversational text.]\n\n"
            "다음 뉴스 기사를 분석해서 요구한 JSON 포맷으로 응답해줘. 만약 기사 제목과 본문이 영어, 중국어, 일본어 등의 외국어로 되어 있다면 기사 제목을 가장 자연스러운 한국어로 번역해서 translatedTitle에 넣어줘. 한국어 기사라면 원본 제목 그대로 제공해줘. 요약(summary) 또한 반드시 기사 전체 내용을 반영하여 한국어로 작성해줘.\n"
            "태그는 고유 명사나 핵심 기술명 위주로 추출하고, 각 태그의 대표 표준명(master)을 함께 제공해줘.\n"
            "단, 태그의 이름(name)과 대표 표준명(master)이 영어(English) 및 한국어(Korean)가 아닌 제3국의 언어(예: 중국어, 일본어, 프랑스어, 독일어 등)인 경우에는 반드시 알맞은 한국어(Korean)로 번역해서 응답해줘. (예: 'グーグル' -> '구글', '微软' -> '마이크로소프트')\n"
            "또한, 기사 내용이 주식 시장이나 기업 가치에 미치는 감성 점수(sentimentScore)를 -1.0(매우 부정/악재)에서 1.0(매우 긍정/호재) 사이의 실수값으로 평가해서 포함해줘. 중립인 경우 0.0을 제공해줘.\n"
            "기사 본문에서 기업 간의 비즈니스 관계가 나타나는 경우, 다음 다섯 가지 관계 유형(type) 중 하나로 매핑하여 relations에 포함해줘:\n"
            "1. SUBSIDIARY_OF: 자회사, 지분 투자 관계 (방향: 피투자사/자회사 -> 투자사/모회사. 예: B사가 A사에 인수됨 -> source: 'B사', target: 'A사', type: 'SUBSIDIARY_OF')\n"
            "2. SUPPLIES_TO: 공급 계약, 납품, 부품 공급 관계 (방향: 공급사 -> 고객사. 예: A사가 B사에 장비를 공급함 -> source: 'A사', target: 'B사', type: 'SUPPLIES_TO')\n"
            "3. PARTNER_WITH: 기술 제휴, 공동 연구, MOU, 파트너십 관계 (방향에 상관없이 A사와 B사가 협력함 -> source: 'A사', target: 'B사', type: 'PARTNER_WITH')\n"
            "4. COMPETE_WITH: 시장 내 경쟁 관계, 특허 소송, 경쟁사 (방향에 상관없이 A사와 B사가 경쟁함 -> source: 'A사', target: 'B사', type: 'COMPETE_WITH')\n"
            "5. RELATED_TO: 그 외의 일반적인 연관 관계 (위의 네 범주에 명확하게 속하지 않는 경우)\n\n"
            "{\n"
            "  \"translatedTitle\": \"한국어로 번역된 기사 제목 (한국어 기사인 경우 원본 제목 그대로)\",\n"
            "  \"summary\": \"뉴스 기사 한 줄 한국어 요약 텍스트\",\n"
            "  \"sentimentScore\": 0.8,\n"
            "  \"tags\": [\n"
            "    {\"name\": \"태그명1\", \"master\": \"대표표준명1\"},\n"
            "    {\"name\": \"태그명2\", \"master\": \"대표표준명2\"}\n"
            "  ],\n"
            "  \"relations\": [\n"
            "    {\"source\": \"대표표준명1\", \"target\": \"대표표준명2\", \"type\": \"RELATED_TO\"}\n"
            "  ]\n"
            "}\n\n"
            f"[기사 제목]: {title}\n"
            f"[기사 본문]: {content}"
        )

        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "format": "json"
        }

        try:
            url = f"{self.api_url}/api/chat"
            print(f"[Extractor] Requesting metadata extraction for: '{title[:30]}...'")
            response = requests.post(url, json=payload, headers=self.headers, timeout=120)
            
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

                parsed_result = json.loads(message_content)
                return parsed_result
            else:
                print(f"[Extractor] Error calling LLM API. Status code: {response.status_code}, Body: {response.text}")
        except Exception as e:
            print(f"[Extractor] Exception during metadata extraction: {e}")

        # 에러 발생 시 Fallback 데이터 리턴
        return {
            "translatedTitle": title,
            "summary": "요약 및 분석 실패 (Gemma 4 API 에러)",
            "sentimentScore": 0.0,
            "tags": [],
            "relations": []
        }

if __name__ == "__main__":
    # 로컬 테스트용
    extractor = NewsExtractor()
    sample_title = "Apple announces Apple Intelligence at WWDC 2024"
    sample_content = "Apple has officially announced Apple Intelligence, a personal intelligence system for iPhone, iPad, and Mac that combines generative models with personal context to deliver useful features. WWDC also featured new updates to iOS, macOS, and Siri powered by ChatGPT integrations."
    
    result = extractor.extract_metadata(sample_title, sample_content)
    print("\n--- Extraction Result ---")
    print(json.dumps(result, indent=2, ensure_ascii=False))
