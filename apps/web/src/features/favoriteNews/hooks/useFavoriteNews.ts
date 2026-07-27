import { useCallback, useEffect, useState } from "react";
import {
  fetchFavoriteNews,
  deleteFavoriteNews,
} from "../api/favoriteNews";
import type { ScrappedNews } from "../api/favoriteNews";

export const useFavoriteNews = () => {
  const [favoriteNews, setFavoriteNews] = useState<ScrappedNews[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavoriteNews = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchFavoriteNews();
      setFavoriteNews(data);

    } catch (error) {
      console.error("관심 뉴스 조회 실패:", error);

    } finally {
      setLoading(false);
    }
  }, []);


  const removeFavoriteNews = useCallback(async (newsId: string) => {
    try {
      await deleteFavoriteNews(newsId);

      setFavoriteNews((prev) =>
        prev.filter((news) => news.id !== newsId)
      );

    } catch (error) {
      console.error("관심 뉴스 삭제 실패:", error);
    }
  }, []);


  useEffect(() => {
  const init = async () => {
    await loadFavoriteNews();
  };

  init();
}, [loadFavoriteNews]);


  return {
    favoriteNews,
    loading,
    removeFavoriteNews,
    reload: loadFavoriteNews,
  };
};