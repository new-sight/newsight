import StockGridItem from "./StockGridItem";
import type { StockInfoData } from "../../../hooks/GetStockInfo";

export default function StockEventMilestone({ data }: { data: StockInfoData | null }) {
  if (!data) return null;

  const formatDividend = (val: number | undefined) => {
    if (val === undefined || val === null) return "None";
    // 소수점 배당률일 경우 퍼센트로 변환 (예: 0.016 -> 1.60%)
    if (val < 1 && val > 0) {
      return (val * 100).toFixed(2) + "%";
    }
    return val.toString() + "%";
  };

  const formatDate = (ts: number | undefined) => {
    if (ts === undefined || ts === null) return "None";
    try {
      const date = new Date(ts * 1000);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return ts.toString();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <StockGridItem title="배당 수익률" value={formatDividend(data.dividendYield)} />
      <StockGridItem title="실적 발표 예상일" value={formatDate(data.earningsTimestamp)} />
    </div>
  );
}
