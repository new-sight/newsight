import { useEffect } from "react";
import { NEWS_PAGE_SIZE } from "../hooks/useNewsList";
import { useDashboardStore } from "../stores/dashboardStore";
import MapSection from "./MapSection";
import NewsSection from "./NewsSection";

export default function DashboardPage() {
  const {
    categoryFilter,
    countryFilter,
    news,
    totalCount,
    page,
    setCategoryFilter,
    setCountryFilter,
    setPage,
    fetchNews,
    toggleLike,
    toggleScrap,
    adjustCommentCount,
  } = useDashboardStore();

  useEffect(() => {
    void fetchNews();
  }, [categoryFilter, countryFilter, page, fetchNews]);

  const totalPages = Math.max(1, Math.ceil(totalCount / NEWS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
      <MapSection
        categoryFilter={categoryFilter}
        countryFilter={countryFilter}
        onCategoryChange={setCategoryFilter}
        onCountryChange={setCountryFilter}
        news={news}
      />

      <NewsSection
        news={news}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        onLikeClick={toggleLike}
        onScrapClick={toggleScrap}
        onCommentCountChange={adjustCommentCount}
      />
    </div>
  );
}
