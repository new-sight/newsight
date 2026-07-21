import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface NewsItemData {
  id: string;
  title: string;
  summary: string;
  link: string;
  tags: string; // Supabase stores tags as comma-separated string (e.g. "Apple, TSLA")
  published_at?: string;
  sentiment_score?: number;
  source?: string;
}

export function useGetStockNews(stockCode: string | null | undefined) {
  const [newsList, setNewsList] = useState<NewsItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockNews = useCallback(async () => {
    if (!stockCode) {
      setNewsList([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get news list with details from Spring Boot API (queries Neo4j and JPA under the hood)
      const response = await axios.get<NewsItemData[]>(
        `http://localhost:8080/api/news/list/${stockCode}`,
      );
      setNewsList(response.data);
    } catch (err: unknown) {
      console.error("[useGetStockNews] Error fetching news:", err);
      let errMsg = "뉴스 데이터를 불러오지 못했습니다.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  }, [stockCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStockNews();
  }, [fetchStockNews]);

  return { newsList, loading, error, refetch: fetchStockNews };
}

export default useGetStockNews;
