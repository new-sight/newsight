import StockGridItem from "./StockGridItem";
import type { StockInfoData } from "../../../hooks/GetStockInfo";
import {
  formatRange,
  formatCurrencyPrice,
} from "../../../../../shared/utils/currency";

export default function StockAnatomyCard({
  data,
}: {
  data: StockInfoData | null;
}) {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-1">
      <StockGridItem
        title="52주 가격 범위"
        value={formatRange(data.fiftyTwoWeekRange, data.currency)}
      />
      <StockGridItem
        title="200일 이동평균선"
        value={formatCurrencyPrice(data.twoHundredDayAverage, data.currency)}
      />
    </div>
  );
}
