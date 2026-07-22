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

  const textColor = isUp ? "text-up" : "text-down";
  const dotColor = isUp ? "bg-up" : "bg-down";

  return (
    <div className="p-3.5">
      <header className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />

          <h2 className={`font-heading text-base font-semibold ${textColor}`}>
            {title}
          </h2>

          <span className="text-[12.5px] text-text-muted">
            {stocks.length}종목
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              className={`font-mono text-base transition disabled:text-text-muted/40 ${textColor}`}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            <span className="min-w-10 text-center font-mono text-[12.5px] tabular-nums text-text-muted">
              {page + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              disabled={page === totalPages - 1}
              className={`font-mono text-base transition disabled:text-text-muted/40 ${textColor}`}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}
      </header>

      <div className="space-y-2">
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