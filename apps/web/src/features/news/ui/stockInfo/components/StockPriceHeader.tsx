import type { StockInfoData } from "../../../hooks/GetStockInfo";
import { formatCurrencyPrice } from "../../../../../shared/utils/currency";

export default function StockPriceHeader({
  data,
}: {
  data: StockInfoData | null;
}) {
  if (!data) return null;

  const change = data.regularMarketChange ?? 0;
  const isUp = change > 0;
  const isDown = change < 0;

  // 상승 시 text-up, 하락 시 text-down, 보합 시 text-white
  const priceColor = isUp ? "text-up" : isDown ? "text-down" : "text-white";
  const prefix = isUp ? "+" : "";

  return (
    <div className="flex flex-col gap-1">
      <div className="rounded-lg p-1 text-xs text-gray-400">
        {/* (주식코드) · (주식장) */}
        {data.symbol} · {data.fullExchangeName || "STOCK MARKET"}
      </div>
      <div className="text-xl font-bold rounded-lg px-1.5 text-white">
        {data.companyName}
      </div>
      <div className="flex gap-2 rounded-lg px-1.5 items-center text-sm">
        {/* regularMarketPrice */}
        <span className="font-bold text-white">
          {formatCurrencyPrice(data.regularMarketPrice, data.currency)} ·
        </span>
        <div className="text-gray-400">전일대비:</div>
        <div className={`flex gap-1 ${priceColor} font-semibold`}>
          {/* regularMarketChange*/}
          <span>
            {prefix}
            {formatCurrencyPrice(data.regularMarketChange, data.currency)}
          </span>
          {/* regularMarketChangePercent */}
          <span>
            ({prefix}
            {data.regularMarketChangePercent?.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
