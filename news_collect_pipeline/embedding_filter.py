import requests
import numpy as np
from typing import List, Dict

class NewsEmbeddingFilter:
    def __init__(self, 
                 api_url: str = "https://api.ollama.com", 
                 api_key: str = "8c0e95f38dfe4fedb5728189fe985dff.b1a6xvWbGDiXEqvvHpvcKtNT",
                 model_name: str = "gemma4:31b"):
        """
        Ollama Cloud API 기반 임베딩 필터 초기화.
        """
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        print(f"[EmbeddingFilter] Initialized with Ollama Cloud API: {self.api_url}, Model: {self.model_name}")

    def _get_embedding(self, text: str) -> List[float]:
        """
        Ollama Cloud API(/api/embeddings)를 사용하여 단일 텍스트의 임베딩 벡터를 가져옵니다.
        """
        url = f"{self.api_url}/api/embeddings"
        payload = {
            "model": self.model_name,
            "prompt": text
        }
        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "embedding" in result:
                    return result["embedding"]
            
            # /api/embeddings 에러 시 최신 /api/embed 포맷으로 폴백 시도
            url_embed = f"{self.api_url}/api/embed"
            payload_embed = {
                "model": self.model_name,
                "input": text
            }
            response = requests.post(url_embed, json=payload_embed, headers=self.headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "embeddings" in result and len(result["embeddings"]) > 0:
                    return result["embeddings"][0]
                    
            print(f"[EmbeddingFilter] Failed to get embedding. HTTP Status: {response.status_code}, Body: {response.text}")
        except Exception as e:
            print(f"[EmbeddingFilter] Error during embedding API request: {e}")
        
        # 에러 발생 시 임의의 더미 0-벡터 반환 (유사도 비교 시 매칭되지 않도록 방지)
        return [0.0] * 768

    def _cosine_similarity_matrix(self, embeddings: np.ndarray) -> np.ndarray:
        """
        NumPy를 사용해 임베딩 행렬 간의 코사인 유사도 매트릭스를 계산합니다.
        embeddings shape: (N, D)
        """
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1e-10
        normalized_embeddings = embeddings / norms
        return np.dot(normalized_embeddings, normalized_embeddings.T)

    def filter_similar_news(self, news_items: List[Dict[str, str]], threshold: float = 0.8) -> List[Dict[str, str]]:
        """
        새로 가져온 뉴스 기사들(news_items) 간의 임베딩 유사도를 비교하여,
        서로 유사도가 threshold 이상인 기사 중 하나만 남기고 필터링합니다.
        """
        if not news_items:
            return []
        
        # 1. 각 뉴스 기사의 임베딩 벡터 리스트 확보
        embedding_list = []
        valid_news_items = []
        
        print(f"[EmbeddingFilter] Fetching embeddings from Ollama Cloud for {len(news_items)} items...")
        for item in news_items:
            title = item.get("title", "")
            summary = item.get("summary", "")
            combined_text = f"{title}. {summary}" if summary else title
            
            # API를 통해 임베딩 획득
            emb = self._get_embedding(combined_text)
            # 유효한 임베딩(0이 아닌 벡터)만 사용
            if any(v != 0.0 for v in emb):
                embedding_list.append(emb)
                valid_news_items.append(item)
            else:
                # 임베딩 획득에 실패한 뉴스 기사는 안전하게 보존하되 유사도 검사 대상에서는 스킵
                valid_news_items.append(item)
                # 더미 벡터를 추가해 연산 차원을 맞춰줌
                embedding_list.append(emb)

        if not embedding_list:
            return news_items

        embeddings = np.array(embedding_list)
        
        # 2. NumPy 코사인 유사도 매트릭스 계산
        similarity_matrix = self._cosine_similarity_matrix(embeddings)
        
        # 3. 중복 제거 대상 판별
        to_keep = [True] * len(valid_news_items)
        
        for i in range(len(valid_news_items)):
            if not to_keep[i]:
                continue
            
            # i번째 뉴스 기사가 더미 벡터(임베딩 실패)라면 유사도 매칭 대상에서 통과시킴
            if all(v == 0.0 for v in embedding_list[i]):
                continue

            for j in range(i + 1, len(valid_news_items)):
                if not to_keep[j]:
                    continue
                
                # j번째 뉴스 기사가 더미 벡터라면 통과시킴
                if all(v == 0.0 for v in embedding_list[j]):
                    continue

                # i와 j 뉴스 비교
                similarity = similarity_matrix[i][j]
                if similarity >= threshold:
                    print(f"[EmbeddingFilter] Filtering out item {j} ('{valid_news_items[j]['title'][:25]}...') "
                          f"as it is too similar to item {i} ('{valid_news_items[i]['title'][:25]}...') "
                          f"(Similarity: {similarity:.4f})")
                    to_keep[j] = False
                    
        # 4. 필터링된 고유 뉴스 기사만 반환
        unique_news = [valid_news_items[i] for i in range(len(valid_news_items)) if to_keep[i]]
        print(f"[EmbeddingFilter] Filtered: {len(news_items)} -> {len(unique_news)} items")
        return unique_news

if __name__ == "__main__":
    # 로컬 테스트용 더미 테스트 코드
    # 실제 API 호출을 위해 객체를 생성해 테스트해볼 수 있습니다.
    test_news = [
        {
            "title": "삼성전자, 차세대 폴더블폰 '갤럭시 Z 폴드6' 전격 공개",
            "summary": "삼성전자가 갤럭시 언팩 행사에서 갤럭시 Z 폴드6와 플립6를 정식 공개했습니다. AI 성능 향상이 특징입니다."
        },
        {
            "title": "삼성전자, 갤럭시 Z 폴드6·플립6 언팩 개최... AI 기능 대거 탑재",
            "summary": "삼성전자가 프랑스 파리에서 언팩을 열고 폴더블 신제품 갤럭시 Z 폴드6와 플립6를 발표하며 인공지능 성능을 과시했습니다."
        }
    ]
    
    filtrator = NewsEmbeddingFilter()
    # 로컬 테스트 시에는 실제 API 키가 필요할 수 있으므로 실행 시점에 예외 발생 가능
    try:
        filtered = filtrator.filter_similar_news(test_news, threshold=0.75)
        print("\n--- Filtered Results ---")
        for idx, item in enumerate(filtered):
            print(f"[{idx + 1}] {item['title']}")
    except Exception as e:
        print(f"Test skipped or failed: {e}")
