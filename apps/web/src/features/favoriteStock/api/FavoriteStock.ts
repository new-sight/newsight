const API_URL = import.meta.env.VITE_API_URL || "";

export interface FavoriteStock {
  stockCode: string;
  korName?: string;
  companyName?: string;
  createdAt?: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function addFavoriteStock(symbol: string) {
  const res = await fetch(`${API_URL}/api/scraps/stocks/${encodeURIComponent(symbol)}`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("관심 종목 추가 실패");
  }
}

export async function removeFavoriteStock(symbol: string) {
  const res = await fetch(`${API_URL}/api/scraps/stocks/${encodeURIComponent(symbol)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("관심 종목 삭제 실패");
  }
}

export async function fetchFavoriteStocks(): Promise<FavoriteStock[]> {
  const res = await fetch(`${API_URL}/api/scraps/stocks`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("관심 종목 조회 실패");
  }

  return res.json();
}
