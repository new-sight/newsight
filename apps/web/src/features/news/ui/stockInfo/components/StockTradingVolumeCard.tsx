import StockGridItem from "./StockGridItem";
// part2
export default function StockTradingVolumeCard() {
  return (
    <div className="grid grid-cols-2 gap-1">
      <StockGridItem title="당일 거래량" value="5608812" />
      <StockGridItem title="3개월 평균 거래량" value="5611875" />

      <div className="col-span-2 rounded-lg p-1">
        <StockGridItem
          title="당일 주가 변동 범위"
          value="1,821,000 - 1,919,000"
        />
      </div>
    </div>
  );
}
