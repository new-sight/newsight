import { useEffect, useState } from 'react';
import {
  fetchFavoriteNews,
  deleteFavoriteNews,
  ScrappedNews,
} from '../api/favoriteNews';

export const useFavoriteNews = () => {
  const [favoriteNews, setFavoriteNews] = useState<ScrappedNews[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavoriteNews = async () => {
    try {
      const data = await fetchFavoriteNews();
      setFavoriteNews(data);
    } finally {
      setLoading(false);
    }
  };

  const removeFavoriteNews = async (newsId: string) => {
    await deleteFavoriteNews(newsId);

    setFavoriteNews((prev) =>
      prev.filter((news) => news.id !== newsId)
    );
  };

  useEffect(() => {
    loadFavoriteNews();
  }, []);

  return {
    favoriteNews,
    loading,
    removeFavoriteNews,
    reload: loadFavoriteNews,
  };
};