export interface FavoriteStockItemDto {
  id: number;
  stockCode: string;
  createdAt: string;
}

const baseUrl = import.meta.env.VITE_API_URL || "";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// 관심 주식 목록 조회
export async function fetchFavoriteStocks(): Promise<FavoriteStockItemDto[]> {
  const response = await fetch(`${baseUrl}/api/scraps/stocks`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("관심 주식 목록을 불러오지 못했습니다.");
  }

  return response.json();
}

// 관심 주식 추가
export async function addFavoriteStock(stockCode: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/scraps/stocks/${encodeURIComponent(stockCode)}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("관심 주식 추가에 실패했습니다.");
  }
}

// 관심 주식 삭제
export async function deleteFavoriteStock(stockCode: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/scraps/stocks/${encodeURIComponent(stockCode)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("관심 주식 삭제에 실패했습니다.");
  }
}

// 관심 주식 여부 확인
export async function checkFavoriteStock(stockCode: string): Promise<boolean> {
  const response = await fetch(`${baseUrl}/api/scraps/stocks/${encodeURIComponent(stockCode)}/check`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return !!data.favorite;
}
