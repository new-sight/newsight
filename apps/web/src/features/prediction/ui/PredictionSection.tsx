import { useState } from "react";
import StockCard, { type StockItem } from "./StockCard";

type PredictionSectionProps = {
  title: string;
  stocks: StockItem[];
  tone: "up" | "down";
};

const ITEMS_PER_PAGE = 3;

export default function PredictionSection({
  title,
  stocks,
  tone,
}: PredictionSectionProps) {
  const [page, setPage] = useState(0);

  const isUp = tone === "up";
  const totalPages = Math.ceil(stocks.length / ITEMS_PER_PAGE);
  const visibleStocks = stocks.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  const textColor = isUp ? "text-red-400" : "text-sky-400";
  const dotColor = isUp ? "bg-red-500" : "bg-sky-500";
  const buttonColor = isUp
    ? "border-red-500/40 text-red-400 hover:bg-red-500/15"
    : "border-sky-500/40 text-sky-400 hover:bg-sky-500/15";

  return (
    <div className="rounded-xl bg-[#111111]  p-5 h-full">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />

          <h2 className={`text-xl font-bold ${textColor}`}>
            {title}
          </h2>

          <span className="text-sm text-zinc-400">
            {stocks.length}종목
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              className={`flex h-8 w-8 items-center justify-center rounded border text-lg transition disabled:cursor-not-allowed disabled:opacity-30 ${buttonColor}`}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            <span className="min-w-10 text-center font-mono text-xs text-zinc-400">
              {page + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              disabled={page === totalPages - 1}
              className={`flex h-8 w-8 items-center justify-center rounded border text-lg transition disabled:cursor-not-allowed disabled:opacity-30 ${buttonColor}`}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}
      </header>

      <div className="space-y-4">
        {visibleStocks.map((item, index) => (
          <StockCard
            key={item.stock}
            item={item}
            rank={page * ITEMS_PER_PAGE + index + 1}
            tone={tone}
          />
        ))}
      </div>
    </div>
  );
}