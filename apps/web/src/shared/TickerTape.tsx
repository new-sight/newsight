import axios from "axios";
import { useEffect, useState } from "react";

type Watchlist = { name: string; ticker: string };

const WATCHLIST: Watchlist[] = [
  { name: "NVIDIA", ticker: "NVDA" },
  { name: "Apple", ticker: "AAPL" },
  { name: "Microsoft", ticker: "MSFT" },
  { name: "Tesla", ticker: "TSLA" },
  { name: "TSMC", ticker: "TSM" },
  { name: "삼성전자", ticker: "005930" },
  { name: "SK하이닉스", ticker: "000660" },
  { name: "NAVER", ticker: "035420" },
  { name: "현대차", ticker: "005380" },
  { name: "LG에너지솔루션", ticker: "373220" },
];

type TickerQuote = Watchlist & { changePercent: number | null };

const REFRESH_INTERVAL_MS = 30_000;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function useTickerQuotes(watchlist: Watchlist[]) {
  const [quotes, setQuotes] = useState<TickerQuote[]>(
    watchlist.map((w) => ({ ...w, changePercent: null })),
  );

  useEffect(() => {
    let cancelled = false;

    const fetchQuotes = () => {
      Promise.all(
        watchlist.map(async (w) => {
          try {
            const res = await axios.get<{
              regularMarketChangePercent?: number;
              error?: string;
            }>(`${API_BASE_URL}/api/stock/info/${w.ticker}`);
            const changePercent = res.data.error
              ? null
              : (res.data.regularMarketChangePercent ?? null);
            return { ...w, changePercent };
          } catch {
            return { ...w, changePercent: null };
          }
        }),
      ).then((next) => {
        if (!cancelled) setQuotes(next);
      });
    };

    fetchQuotes();
    const id = setInterval(fetchQuotes, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // watchlist is a module-level constant; only re-run on mount/unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return quotes;
}

export default function TickerTape() {
  const quotes = useTickerQuotes(WATCHLIST);
  const items = [...quotes, ...quotes];

  return (
    <div className="overflow-hidden whitespace-nowrap border-b border-border bg-bg-sunken py-2">
      <div className="inline-flex animate-[marquee_20s_linear_infinite] pl-6">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 whitespace-nowrap border-r border-border px-5 font-mono text-[13px]"
          >
            <b className="font-semibold text-text">{item.name}</b>
            <span className="text-text-muted">{item.ticker}</span>
            <span
              className={
                "font-semibold " +
                (item.changePercent === null
                  ? "text-text-muted"
                  : item.changePercent >= 0
                    ? "text-up"
                    : "text-down")
              }
            >
              {item.changePercent === null
                ? "–"
                : `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
