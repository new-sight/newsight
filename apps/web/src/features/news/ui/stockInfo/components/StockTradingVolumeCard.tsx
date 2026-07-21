import StockGridItem from "./StockGridItem";
import type { StockInfoData } from "../../../hooks/GetStockInfo";
import { formatRange } from "../../../../../shared/utils/currency";

export default function StockTradingVolumeCard({ data }: { data: StockInfoData | null }) {
  if (!data) return null;

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "None";
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-2 gap-1">
      <StockGridItem title="당일 거래량" value={formatNumber(data.regularMarketVolume)} />
      <StockGridItem title="3개월 평균 거래량" value={formatNumber(data.averageDailyVolume3Month)} />

      <div className="col-span-2 rounded-lg p-1">
        <StockGridItem
          title="당일 주가 변동 범위"
          value={formatRange(data.regularMarketDayRange, data.currency)}
        />
      </div>
    </div>
  );
}
