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
      // 1. Get news IDs associated with the stock from Spring Boot API
      const idResponse = await axios.get<string[]>(
        `http://localhost:8080/api/news/list/${stockCode}`,
      );
      const newsIds = idResponse.data;

      if (!newsIds || newsIds.length === 0) {
        setNewsList([]);
        return;
      }

      // 2. Fetch full details from Supabase using environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          "Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing.",
        );
      }

      // Format IDs to postgrest IN filter: (id1,id2,id3)
      const idsParam = `(${newsIds.join(",")})`;
      const selectFields =
        "id,title,summary,link,tags,published_at,sentiment_score,source";

      const supabaseResponse = await axios.get<NewsItemData[]>(
        `${supabaseUrl}/rest/v1/news?id=in.${idsParam}&select=${selectFields}&order=published_at.desc`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            Accept: "application/json",
          },
        },
      );

      const details = supabaseResponse.data;
      setNewsList(details);
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
