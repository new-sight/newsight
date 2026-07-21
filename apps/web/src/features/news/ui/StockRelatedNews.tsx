import { useParams } from "react-router-dom";
import useGetStockNews from "../hooks/GetStockNews";
import NewsItem from "./stockInfo/components/NewsItem";

export default function StockRelatedNews() {
  const { stockCode } = useParams<{ stockCode: string }>();
  const { newsList, loading, error } = useGetStockNews(stockCode);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-full h-32 rounded-xl bg-gray-600/5 animate-pulse border border-border/20 flex flex-col p-4 gap-3"
          >
            <div className="h-6 bg-gray-600/20 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-600/20 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-600/20 rounded w-1/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
        뉴스를 불러오는 도중 에러가 발생했습니다: {error}
      </div>
    );
  }

  if (!newsList || newsList.length === 0) {
    return (
      <div className="w-full rounded-xl p-8 bg-gray-600/5 border border-border/20 text-text-muted text-center text-base">
        관련 뉴스 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {newsList.map((news) => (
        <NewsItem key={news.id} news={news} />
      ))}
    </div>
  );
}
