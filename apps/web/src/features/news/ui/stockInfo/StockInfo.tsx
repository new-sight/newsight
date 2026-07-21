import StockPriceHeader from "./components/StockPriceHeader";
import StockTradingVolumeCard from "./components/StockTradingVolumeCard";
import StockAnatomyCard from "./components/StockAnatomyCard";
import StockEventMilestone from "./components/StockEventMilestone";
import StockKeyMetricsBoard from "./components/StockKeyMetricsBoard";
import StockChart from "./components/StockChart";
import GetStockInfo from "../../hooks/GetStockInfo";

export default function StockInfo({ symbol }: { symbol: string }) {
  const { data, loading, error } = GetStockInfo(symbol);

  if (loading) {
    return (
      <div className="w-full rounded-xl p-6 bg-gray-600/10 backdrop-blur-md shadow-lg flex items-center justify-center text-text-muted">
        주식 정보를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl p-6 bg-gray-600/10 backdrop-blur-md shadow-lg flex items-center justify-center text-red-400 text-sm">
        에러: {error}
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl p-3 bg-gray-600/10 backdrop-blur-md shadow-lg flex flex-col gap-2">
      <StockPriceHeader data={data} />
      <StockChart symbol={symbol} />
      <span className="text-lg font-bold">투자 지표</span>
      <StockTradingVolumeCard data={data} />
      <StockKeyMetricsBoard data={data} />
      <StockAnatomyCard data={data} />
      <StockEventMilestone data={data} />
    </div>
  );
}
