import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { NewsItemData } from "../../news/hooks/GetStockNews";

// 관심 종목 여러 개의 뉴스를 합쳐 최신순으로 정렬한다.
export function useFavoriteStocksNews(stocks: string[]) {
  const [newsList, setNewsList] = useState<NewsItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (stocks.length === 0) {
      setNewsList([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const results = await Promise.all(
        stocks.map((symbol) =>
          axios
            .get<NewsItemData[]>(`${baseUrl}/api/news/list/${symbol}`)
            .then((res) => res.data)
            .catch(() => []),
        ),
      );

      const merged = new Map<string, NewsItemData>();
      results.flat().forEach((item) => merged.set(item.id, item));

      setNewsList(
        Array.from(merged.values()).sort((a, b) =>
          (b.published_at || "").localeCompare(a.published_at || ""),
        ),
      );
    } catch {
      setError("뉴스 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [stocks]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return { newsList, loading, error };
}

export default useFavoriteStocksNews;
