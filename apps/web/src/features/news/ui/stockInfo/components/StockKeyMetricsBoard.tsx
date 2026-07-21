import StockGridItem from "./StockGridItem";
import type { StockInfoData } from "../../../hooks/GetStockInfo";
import { formatMarketCap, formatCurrencyPrice } from "../../../../../shared/utils/currency";

export default function StockKeyMetricsBoard({ data }: { data: StockInfoData | null }) {
  if (!data) return null;

  const formatRatio = (num: number | undefined) => {
    if (num === undefined || num === null) return "None";
    return num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <StockGridItem title="시가총액" value={formatMarketCap(data.marketCap, data.currency)} />
      <StockGridItem title="주당순이익" value={formatCurrencyPrice(data.epsTrailingTwelveMonths, data.currency)} />
      <StockGridItem title="과거 실적 PER" value={formatRatio(data.trailingPE)} />
      <StockGridItem title="예상 실적 PER" value={formatRatio(data.forwardPE)} />
      <StockGridItem title="주가순자산비율" value={formatRatio(data.priceToBook)} />
    </div>
  );
}
