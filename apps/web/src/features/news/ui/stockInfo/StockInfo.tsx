import StockPriceHeader from "./components/StockPriceHeader";
import StockTradingVolumeCard from "./components/StockTradingVolumeCard";
import StockAnatomyCard from "./components/StockAnatomyCard";
import StockEventMilestone from "./components/StockEventMilestone";
import StockKeyMetricsBoard from "./components/StockKeyMetricsBoard";
import StockChart from "./components/StockChart";

export default function StockInfo() {
  return (
    <div className="w-full rounded-xl p-3 bg-gray-600/10 backdrop-blur-md shadow-lg flex flex-col gap-2">
      <StockPriceHeader />
      <StockChart />
      <span className="text-lg font-bold">투자 지표</span>
      <StockTradingVolumeCard />
      <StockKeyMetricsBoard />
      <StockAnatomyCard />
      <StockEventMilestone />
    </div>
  );
}
