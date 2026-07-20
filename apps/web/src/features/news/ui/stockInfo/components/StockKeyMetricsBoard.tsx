import StockGridItem from "./StockGridItem";
// part3
export default function StockKeyMetricsBoard() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StockGridItem title="시가총액" value="1307.55조" />
      {/* marketCap */}
      <StockGridItem title="주당순이익" value="None" />
      {/* epsTrailingTwelveMonths */}
      <StockGridItem title="과거 실적 PER" value="None" />
      {/* trailingPE */}
      <StockGridItem title="예상 실적 PER" value="None" />
      {/* forwardPE */}
      <StockGridItem title="주가순자산비율" value="None" />
    </div>
  );
}
