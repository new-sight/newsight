export interface ScrappedNews {
  id: string;
  title: string;
  link: string;
  source: string;
  tags: string;
  publishedAt: string;
  scrappedAt: string;
}

const baseUrl = import.meta.env.VITE_API_URL || "";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// 스크랩 목록 조회
export async function fetchFavoriteNews(): Promise<ScrappedNews[]> {
  const response = await fetch(`${baseUrl}/api/news/scraps`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("스크랩 목록을 불러오지 못했습니다.");
  }

  return response.json();
}

// 스크랩 추가 (팀원이 ⭐ 버튼에서 사용)
export async function addFavoriteNews(newsId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/news/${newsId}/scrap`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("스크랩 추가에 실패했습니다.");
  }
}

// 스크랩 삭제
export async function deleteFavoriteNews(newsId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/news/${newsId}/scrap`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("스크랩 삭제에 실패했습니다.");
  }
}
