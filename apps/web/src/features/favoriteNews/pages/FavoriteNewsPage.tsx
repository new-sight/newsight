import { useEffect, useState } from "react";
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

    loadScraps();
  }, []);

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

  return (
    <div className="space-y-4 sm:-mt-4 -mx-4 lg:-mx-14">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <span className="material-symbols-outlined text-sky-400">
            newspaper
          </span>
          관심 뉴스
        </h1>

        <p className="text-sm text-text-muted mt-1">
          스크랩한 뉴스를 한눈에 모아보고 바로 확인하세요.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-text-muted">
          스크랩한 뉴스를 불러오는 중...
        </div>
      ) : newsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center backdrop-blur-sm">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
            newspaper
          </span>

          <p className="text-base font-semibold text-white/60">
            스크랩한 뉴스가 없습니다.
          </p>

          <p className="text-xs text-white/40 mt-1">
            뉴스 목록에서 별 아이콘을 눌러 스크랩해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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