import React, { useEffect, useState } from "react";
import {
  fetchFavoriteNews,
  deleteFavoriteNews,
} from "../api/favoriteNews";
import type { ScrappedNews } from "../api/favoriteNews";
import FavoriteNewsCard from "../components/FavoriteNewsCard";

export const FavoriteNewsPage = () => {
  const [newsList, setNewsList] = useState<ScrappedNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScraps();
  }, []);

  const loadScraps = async () => {
    try {
      setIsLoading(true);

      const data = await fetchFavoriteNews();
      setNewsList(data);
    } catch (error) {
      console.error("스크랩 목록 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnscrap = async (newsId: string) => {
    try {
      await deleteFavoriteNews(newsId);

      setNewsList((prev) =>
        prev.filter((item) => item.id !== newsId)
      );
    } catch (error) {
      console.error("스크랩 삭제 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-400">
        스크랩한 뉴스를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🔖 스크랩한 뉴스
      </h1>

      {newsList.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl">
          저장된 스크랩 뉴스가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newsList.map((news) => (
            <FavoriteNewsCard
              key={news.id}
              news={news}
              onUnscrap={handleUnscrap}
            />
          ))}
        </div>
      )}
    </div>
  );
};