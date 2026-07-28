import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface NewsItemData {
  id: string;
  title: string;
  summary: string;
  link: string;
  tags: string;
  published_at?: string;
  sentiment_score?: number;
  source?: string;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  scrappedByMe?: boolean;
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
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get<NewsItemData[]>(
        `${baseUrl}/api/news/list/${stockCode}`,
        { headers },
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
    fetchStockNews();
  }, [fetchStockNews]);

  const applyLikeResult = (newsId: string, liked: boolean) => {
    setNewsList((prev) =>
      prev.map((item) => {
        if (item.id === newsId) {
          const delta = liked ? 1 : -1;
          const currentCount = item.likeCount ?? 0;
          return {
            ...item,
            likedByMe: liked,
            likeCount: Math.max(
              0,
              currentCount + (item.likedByMe === liked ? 0 : delta),
            ),
          };
        }
        return item;
      }),
    );
  };

  const applyScrapResult = (newsId: string, scrapped: boolean) => {
    setNewsList((prev) =>
      prev.map((item) =>
        item.id === newsId ? { ...item, scrappedByMe: scrapped } : item,
      ),
    );
  };

  const adjustCommentCount = (newsId: string, delta: number) => {
    setNewsList((prev) =>
      prev.map((item) =>
        item.id === newsId
          ? {
              ...item,
              commentCount: Math.max(0, (item.commentCount ?? 0) + delta),
            }
          : item,
      ),
    );
  };

  return {
    newsList,
    loading,
    error,
    refetch: fetchStockNews,
    applyLikeResult,
    applyScrapResult,
    adjustCommentCount,
  };
}

export default useGetStockNews;
