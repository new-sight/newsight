import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useGetStockNews from "../hooks/GetStockNews";
import NewsItem from "./stockInfo/components/NewsItem";

export default function StockRelatedNews() {
  const { stockCode } = useParams<{ stockCode: string }>();
  const { newsList, loading, error } = useGetStockNews(stockCode);
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const [prevStockCode, setPrevStockCode] = useState(stockCode);
  if (stockCode !== prevStockCode) {
    setPrevStockCode(stockCode);
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-full h-32 rounded-xl bg-gray-600/5 animate-pulse border border-border/20 flex flex-col p-4 gap-3"
          >
            <div className="h-6 bg-gray-600/20 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-600/20 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-600/20 rounded w-1/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
        뉴스를 불러오는 도중 에러가 발생했습니다: {error}
      </div>
    );
  }

  if (!newsList || newsList.length === 0) {
    return (
      <div className="w-full rounded-xl p-8 bg-gray-600/5 border border-border/20 text-text-muted text-center text-base">
        관련 뉴스 데이터가 존재하지 않습니다.
      </div>
    );
  }

  const itemsPerPage = 5;
  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  // Get current page news
  const displayedNews = newsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll the parent scrollable container to top
    const scrollContainer = listRef.current?.closest(".overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div ref={listRef} className="flex flex-col gap-6 pb-8">
      {/* News List */}
      <div className="flex flex-col gap-4">
        {displayedNews.map((news) => (
          <NewsItem key={news.id} news={news} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2 shrink-0">
          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-9 h-9 bg-bg-panel/40 hover:bg-bg-panel/80 disabled:opacity-20 border border-border/80 hover:border-accent/40 rounded-xl text-text hover:text-white transition-all disabled:pointer-events-none cursor-pointer flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] select-none">
              chevron_left
            </span>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-9 h-9 font-sans text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                currentPage === page
                  ? "bg-accent border-accent text-white font-bold shadow-md shadow-accent/20"
                  : "bg-bg-panel/40 hover:bg-bg-panel/80 border-border/80 hover:border-accent/40 text-text-muted hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-9 h-9 bg-bg-panel/40 hover:bg-bg-panel/80 disabled:opacity-20 border border-border/80 hover:border-accent/40 rounded-xl text-text hover:text-white transition-all disabled:pointer-events-none cursor-pointer flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] select-none">
              chevron_right
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
