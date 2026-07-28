import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useGetStockInfo from "../news/hooks/GetStockInfo";
import NewsItem from "../news/ui/stockInfo/components/NewsItem";
import FavoriteStockBox from "./ui/FavoriteStockBox";
import SearchBar, { type SupabaseStockItem } from "./ui/SearchBar";
import { useFavoriteStocksNews } from "./hooks/useFavoriteStocksNews";

interface FavoriteStockItemProps {
  symbol: string;
  korName?: string;
  onRemove: (symbol: string) => void;
}

function FavoriteStockItem({
  symbol,
  korName: initialKorName,
  onRemove,
}: FavoriteStockItemProps) {
  const navigate = useNavigate();
  const { data, loading } = useGetStockInfo(symbol);
  const [fetchedKorName, setFetchedKorName] = useState<string | undefined>();

  useEffect(() => {
    // initialKorName이 전달되었으면 Supabase 별도 조회가 필요 없음
    if (initialKorName) return;

    let isMounted = true;
    async function fetchKorNameFromSupabase() {
      try {
        const supabaseUrl =
          import.meta.env.VITE_SUPABASE_URL ||
          "https://rjtoalnqvrgsqmqcgrde.supabase.co";
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        const response = await axios.get<SupabaseStockItem[]>(
          `${supabaseUrl}/rest/v1/stock?select=kor_name,stock_name&stock_code=eq.${encodeURIComponent(
            symbol,
          )}&limit=1`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
            },
          },
        );
        if (isMounted && response.data && response.data.length > 0) {
          const item = response.data[0];
          setFetchedKorName(item.kor_name || item.stock_name);
        }
      } catch (err) {
        console.error(
          `[FavoriteStock] Failed to fetch kor_name for ${symbol}:`,
          err,
        );
      }
    }

    fetchKorNameFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [symbol, initialKorName]);

  const korName = initialKorName || fetchedKorName;
  const displayName = korName || data?.shortName || data?.companyName || symbol;

  return (
    <FavoriteStockBox
      ticker={symbol}
      companyName={displayName}
      stockPrice={data?.regularMarketPrice || 0}
      changePercent={data?.regularMarketChangePercent || 0}
      currency={data?.currency}
      loading={loading}
      onRemove={() => onRemove(symbol)}
      onClick={() => navigate(`/news/${symbol}`)}
    />
  );
}

export default function FavoriteStock() {
  const [stocks, setStocks] = useState<{ symbol: string; korName?: string }[]>([
    { symbol: "AAPL", korName: "애플" },
    { symbol: "NVDA", korName: "엔비디아" },
    { symbol: "TSLA", korName: "테슬라" },
    { symbol: "MSFT", korName: "마이크로소프트" },
    { symbol: "AMZN", korName: "아마존" },
  ]);

  const handleAddStock = (symbol: string, korName?: string) => {
    const targetSymbol = symbol.toUpperCase();
    if (stocks.some((item) => item.symbol === targetSymbol)) {
      alert("이미 등록된 관심 종목입니다.");
      return;
    }

    setStocks((prev) => [...prev, { symbol: targetSymbol, korName }]);
  };

  const handleRemoveStock = (ticker: string) => {
    setStocks((prev) => prev.filter((item) => item.symbol !== ticker));
  };

  const {
    newsList,
    loading: newsLoading,
    error: newsError,
  } = useFavoriteStocksNews(stocks);

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

        {/* 독립 컴포넌트로 분리된 종목 검색 및 추가 SearchBar */}
        <SearchBar onAddStock={handleAddStock} />
      </div>

      {/* 종목 카드 그리드 */}
      {stocks.length === 0 ? (
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
          {stocks.map((item) => (
            <FavoriteStockItem
              key={item.symbol}
              symbol={item.symbol}
              korName={item.korName}
              onRemove={handleRemoveStock}
            />
          ))}
        </div>
      )}

      {/* 관심 종목 뉴스 모아보기 */}
      {stocks.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-400">
              newspaper
            </span>
            관심 종목 뉴스 모아보기
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
            <div className="flex flex-col gap-4">
              {newsList.slice(0, 10).map((news) => (
                <NewsItem key={news.id} news={news} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
