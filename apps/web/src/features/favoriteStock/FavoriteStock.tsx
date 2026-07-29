import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toggleLike, toggleScrap } from "../dashboard/api/news";
import useGetStockInfo from "../news/hooks/GetStockInfo";
import NewsItem from "../news/ui/stockInfo/components/NewsItem";
import FavoriteStockBox from "./ui/FavoriteStockBox";
import SearchBar, { type SupabaseStockItem } from "./ui/SearchBar";
import { useFavoriteStocksNews } from "./hooks/useFavoriteStocksNews";
import {
  addFavoriteStock,
  fetchFavoriteStocks,
  removeFavoriteStock,
  type FavoriteStock as FavoriteStockResponse,
} from "./api/favoriteStock";

type Stock = { symbol: string; korName?: string };

function FavoriteStockItem({
  stock,
  onRemove,
}: {
  stock: Stock;
  onRemove: (symbol: string) => void;
}) {
  const navigate = useNavigate();
  const { data, loading } = useGetStockInfo(stock.symbol);
  const [fetchedName, setFetchedName] = useState<string>();

  useEffect(() => {
    if (stock.korName) return;
    let active = true;
    const url =
      import.meta.env.VITE_SUPABASE_URL ||
      "https://rjtoalnqvrgsqmqcgrde.supabase.co";
    const key =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdG9hbG5xdnJnc3FtcWNncmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDUzNTMsImV4cCI6MjA5ODM4MTM1M30.GCwFgo5_bFk7gh50yv83RCEgZmk5Fqq5LGPXE6dFNVs";
    axios
      .get<SupabaseStockItem[]>(
        `${url}/rest/v1/stock?select=kor_name,stock_name&stock_code=eq.${encodeURIComponent(stock.symbol)}&limit=1`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      )
      .then((response) => {
        if (active)
          setFetchedName(
            response.data[0]?.kor_name || response.data[0]?.stock_name,
          );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [stock.korName, stock.symbol]);

  return (
    <FavoriteStockBox
      ticker={stock.symbol}
      companyName={
        stock.korName ||
        fetchedName ||
        data?.shortName ||
        data?.companyName ||
        stock.symbol
      }
      stockPrice={data?.regularMarketPrice || 0}
      changePercent={data?.regularMarketChangePercent || 0}
      currency={data?.currency}
      loading={loading}
      onRemove={() => onRemove(stock.symbol)}
      onClick={() => navigate(`/news/${stock.symbol}`)}
    />
  );
}

export default function FavoriteStock() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchFavoriteStocks()
      .then((items: FavoriteStockResponse[]) => {
        if (active)
          setStocks(
            items.map((item) => ({
              symbol: item.stockCode,
              korName: item.korName || item.companyName,
            })),
          );
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingStocks(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addStock = async (symbol: string, korName?: string) => {
    const normalized = symbol.toUpperCase();
    if (stocks.some((stock) => stock.symbol === normalized))
      return alert("이미 등록된 관심 종목입니다.");
    try {
      await addFavoriteStock(normalized);
      setStocks((previous) => [...previous, { symbol: normalized, korName }]);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "관심 종목 추가에 실패했습니다.",
      );
    }
  };

  const removeStock = async (symbol: string) => {
    try {
      await removeFavoriteStock(symbol);
      setStocks((previous) =>
        previous.filter((stock) => stock.symbol !== symbol),
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "관심 종목 해제에 실패했습니다.",
      );
    }
  };

  const {
    newsList,
    loading: newsLoading,
    error: newsError,
    applyLikeResult,
    applyScrapResult,
    adjustCommentCount,
  } = useFavoriteStocksNews(stocks);

  const likeNews = async (newsId: string) => {
    try {
      const result = await toggleLike(newsId);
      applyLikeResult(newsId, result.liked);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "좋아요 처리에 실패했습니다.",
      );
    }
  };

  const scrapNews = async (newsId: string) => {
    try {
      const result = await toggleScrap(newsId);
      applyScrapResult(newsId, result.scrapped);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "스크랩 처리에 실패했습니다.",
      );
    }
  };

  // Pagination logic (5 items per page)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(newsList.length / itemsPerPage);
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  const visiblePages = Array.from(
    { length: Math.max(0, endPage - startPage + 1) },
    (_, i) => startPage + i,
  );

  const displayedNews = newsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-4 sm:-mt-4 -mx-4 lg:-mx-14">
      {/* 헤더 타이틀 및 검색 추가 창 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-400">
              show_chart
            </span>
            관심 종목
          </h1>
          <p className="text-sm text-text-muted mt-1">
            관심 등록한 주식 종목의 실시간 시세 및 관련 뉴스를 한눈에
            확인하세요.
          </p>
        </div>
        <SearchBar onAddStock={addStock} />
      </div>

      {/* 관심 종목 카드 그리드 */}
      {loadingStocks ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/10"
            />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center backdrop-blur-sm">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
            show_chart
          </span>
          <p className="text-base font-semibold text-white/60">
            등록된 관심 종목이 없습니다.
          </p>
          <p className="text-xs text-white/40 mt-1">
            우측 상단에서 티커나 회사명을 입력하여 종목을 추가해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <FavoriteStockItem
              key={stock.symbol}
              stock={stock}
              onRemove={removeStock}
            />
          ))}
        </div>
      )}

      {/* 종목 관련 뉴스 섹션 */}
      {stocks.length > 0 && (
        <div
          ref={listRef}
          className="space-y-4 mt-8 pt-4 border-t border-white/10"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-400">
              newspaper
            </span>
            종목 관련 뉴스
          </h2>

          {newsLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-32 rounded-xl bg-gray-600/5 animate-pulse border border-border/20"
                />
              ))}
            </div>
          ) : newsError ? (
            <div className="w-full rounded-xl p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {newsError}
            </div>
          ) : newsList.length === 0 ? (
            <div className="w-full rounded-xl p-8 bg-gray-600/5 border border-border/20 text-text-muted text-center text-base">
              관심 종목 관련 뉴스가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-8">
              {/* 뉴스 리스트 */}
              <div className="flex flex-col gap-4">
                {displayedNews.map((news) => (
                  <NewsItem
                    key={news.id}
                    news={news}
                    onLikeClick={likeNews}
                    onScrapClick={scrapNews}
                    onCommentCountChange={adjustCommentCount}
                  />
                ))}
              </div>

              {/* 페이지네이션 컨트롤 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 bg-bg-panel/40 hover:bg-bg-panel/80 disabled:opacity-20 border border-border/80 hover:border-accent/40 rounded-xl text-text hover:text-white transition-all disabled:pointer-events-none cursor-pointer flex items-center justify-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] select-none">
                      chevron_left
                    </span>
                  </button>

                  {visiblePages.map((page) => (
                    <button
                      type="button"
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

                  <button
                    type="button"
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
          )}
        </div>
      )}
    </div>
  );
}
