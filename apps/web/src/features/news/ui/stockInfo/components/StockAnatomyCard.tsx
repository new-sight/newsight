import StockGridItem from "./StockGridItem";
// part4
export default function StockAnatomyCard() {
  return (
    <div className="flex flex-col gap-1">
      {/* fiftyTwoWeekRange */}
      <StockGridItem title="52주 가격 범위" value="245000 - 2987000" />
      {/* twoHundredDayAverage */}
      <StockGridItem title="200일 이동평균선" value="1120137.5" />
    </div>
  );
}
