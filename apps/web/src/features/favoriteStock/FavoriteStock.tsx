import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetStockInfo from "../news/hooks/GetStockInfo";
import FavoriteStockBox from "./ui/FavoriteStockBox";

interface FavoriteStockItemProps {
  symbol: string;
  onRemove: (symbol: string) => void;
}

function FavoriteStockItem({ symbol, onRemove }: FavoriteStockItemProps) {
  const navigate = useNavigate();
  const { data, loading } = useGetStockInfo(symbol);

  return (
    <FavoriteStockBox
      ticker={symbol}
      companyName={data?.shortName || symbol}
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
  const [stocks, setStocks] = useState<string[]>([
    "AAPL",
    "NVDA",
    "TSLA",
    "MSFT",
    "AMZN",
  ]);
  const [newTicker, setNewTicker] = useState("");

  const handleAddStock = () => {
    if (!newTicker.trim()) return;
    const tickerUpper = newTicker.trim().toUpperCase();
    if (stocks.includes(tickerUpper)) {
      alert("이미 등록된 관심 종목입니다.");
      return;
    }
    setStocks((prev) => [...prev, tickerUpper]);
    setNewTicker("");
  };

  const handleRemoveStock = (ticker: string) => {
    setStocks((prev) => prev.filter((s) => s !== ticker));
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

        {/* 종목 추가 입력 폼 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="티커 입력 (예: AAPL)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStock()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="button"
            onClick={handleAddStock}
            className="flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            추가
          </button>
        </div>
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
            우측 상단에서 티커를 입력하여 종목을 추가해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((symbol) => (
            <FavoriteStockItem
              key={symbol}
              symbol={symbol}
              onRemove={handleRemoveStock}
            />
          ))}
        </div>
      )}
      <div className="text-xl font-bold text-white flex items-center gap-2.5 mt-10">
        <span className="material-symbols-outlined text-emerald-400">
          newspaper
        </span>
        관심 종목 관련 뉴스
      </div>
    </div>
  );
}
