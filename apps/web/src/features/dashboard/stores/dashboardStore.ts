import { create } from "zustand";
import { fetchNewsList, toggleLike, toggleScrap, type NewsListItem } from "../api/news";
import type { Country, NewsCategory } from "../data";

type DashboardStore = {
  categoryFilter: NewsCategory | "all";
  countryFilter: Country | "all";
  page: number;
  news: NewsListItem[];
  totalCount: number;
  requestId: number;
  setCategoryFilter: (value: NewsCategory | "all") => void;
  setCountryFilter: (value: Country | "all") => void;
  setPage: (page: number) => void;
  fetchNews: () => Promise<void>;
  toggleLike: (newsId: string) => Promise<void>;
  toggleScrap: (newsId: string) => Promise<void>;
  adjustCommentCount: (newsId: string, delta: number) => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  categoryFilter: "all",
  countryFilter: "all",
  page: 0,
  news: [],
  totalCount: 0,
  requestId: 0,
  setCategoryFilter: (categoryFilter) => set({ categoryFilter, page: 0 }),
  setCountryFilter: (countryFilter) => set({ countryFilter, page: 0 }),
  setPage: (page) => set({ page }),
  fetchNews: async () => {
    const { categoryFilter, countryFilter, page, requestId } = get();
    const nextRequestId = requestId + 1;
    set({ requestId: nextRequestId });

    const response = await fetchNewsList({
      country: countryFilter === "all" ? undefined : countryFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      page,
      size: 5,
    });

    if (get().requestId === nextRequestId) {
      set({ news: response.news, totalCount: response.totalCount });
    }
  },
  toggleLike: async (newsId) => {
    if (!localStorage.getItem("accessToken")) {
      alert("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }
    try {
      const result = await toggleLike(newsId);
      set(({ news }) => ({
        news: news.map((item) =>
          item.newsId === newsId
            ? { ...item, likedByMe: result.liked, likeCount: result.likeCount }
            : item,
        ),
      }));
    } catch {
      alert("좋아요 처리에 실패했습니다.");
    }
  },
  toggleScrap: async (newsId) => {
    if (!localStorage.getItem("accessToken")) {
      alert("스크랩을 누르려면 로그인이 필요합니다.");
      return;
    }
    try {
      const result = await toggleScrap(newsId);
      set(({ news }) => ({
        news: news.map((item) =>
          item.newsId === newsId
            ? { ...item, scrappedByMe: result.scrapped }
            : item,
        ),
      }));
    } catch {
      alert("스크랩 처리에 실패했습니다.");
    }
  },
  adjustCommentCount: (newsId, delta) =>
    set(({ news }) => ({
      news: news.map((item) =>
        item.newsId === newsId
          ? { ...item, commentCount: item.commentCount + delta }
          : item,
      ),
    })),
}));
