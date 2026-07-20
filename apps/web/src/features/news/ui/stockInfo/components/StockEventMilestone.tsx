import StockGridItem from "./StockGridItem";
// part5
export default function StockEventMilestone() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StockGridItem title="배당 수익률" value="0.16" />
      <StockGridItem title="실적 발표 예상일" value="1776837600" />
    </div>
  );
}
