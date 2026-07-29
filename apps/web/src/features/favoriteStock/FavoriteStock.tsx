import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toggleLike, toggleScrap } from "../dashboard/api/news";
import useGetStockInfo from "../news/hooks/GetStockInfo";
import NewsItem from "../news/ui/stockInfo/components/NewsItem";
import FavoriteStockBox from "./ui/FavoriteStockBox";
import SearchBar, { type SupabaseStockItem } from "./ui/SearchBar";
import { useFavoriteStocksNews } from "./hooks/useFavoriteStocksNews";
import { addFavoriteStock, fetchFavoriteStocks, removeFavoriteStock, type FavoriteStock as FavoriteStockResponse } from "./api/FavoriteStock";

type Stock = { symbol: string; korName?: string };

function FavoriteStockItem({ stock, onRemove }: { stock: Stock; onRemove: (symbol: string) => void }) {
  const navigate = useNavigate();
  const { data, loading } = useGetStockInfo(stock.symbol);
  const [fetchedName, setFetchedName] = useState<string>();

  useEffect(() => {
    if (stock.korName) return;
    let active = true;
    const url = import.meta.env.VITE_SUPABASE_URL || "https://rjtoalnqvrgsqmqcgrde.supabase.co";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    axios.get<SupabaseStockItem[]>(`${url}/rest/v1/stock?select=kor_name,stock_name&stock_code=eq.${encodeURIComponent(stock.symbol)}&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      .then((response) => { if (active) setFetchedName(response.data[0]?.kor_name || response.data[0]?.stock_name); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [stock.korName, stock.symbol]);

  return <FavoriteStockBox ticker={stock.symbol} companyName={stock.korName || fetchedName || data?.shortName || data?.companyName || stock.symbol} stockPrice={data?.regularMarketPrice || 0} changePercent={data?.regularMarketChangePercent || 0} currency={data?.currency} loading={loading} onRemove={() => onRemove(stock.symbol)} onClick={() => navigate(`/news/${stock.symbol}`)} />;
}

export default function FavoriteStock() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);

  useEffect(() => {
    let active = true;
    fetchFavoriteStocks().then((items: FavoriteStockResponse[]) => {
      if (active) setStocks(items.map((item) => ({ symbol: item.stockCode, korName: item.korName || item.companyName })));
    }).catch(() => undefined).finally(() => { if (active) setLoadingStocks(false); });
    return () => { active = false; };
  }, []);

  const addStock = async (symbol: string, korName?: string) => {
    const normalized = symbol.toUpperCase();
    if (stocks.some((stock) => stock.symbol === normalized)) return alert("이미 등록된 관심 종목입니다.");
    try {
      await addFavoriteStock(normalized);
      setStocks((previous) => [...previous, { symbol: normalized, korName }]);
    } catch (error) { alert(error instanceof Error ? error.message : "관심 종목 추가에 실패했습니다."); }
  };
  const removeStock = async (symbol: string) => {
    try {
      await removeFavoriteStock(symbol);
      setStocks((previous) => previous.filter((stock) => stock.symbol !== symbol));
    } catch (error) { alert(error instanceof Error ? error.message : "관심 종목 해제에 실패했습니다."); }
  };

  const { newsList, loading: newsLoading, error: newsError, applyLikeResult, applyScrapResult, adjustCommentCount } = useFavoriteStocksNews(stocks);
  const likeNews = async (newsId: string) => { try { const result = await toggleLike(newsId); applyLikeResult(newsId, result.liked); } catch (error) { alert(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다."); } };
  const scrapNews = async (newsId: string) => { try { const result = await toggleScrap(newsId); applyScrapResult(newsId, result.scrapped); } catch (error) { alert(error instanceof Error ? error.message : "스크랩 처리에 실패했습니다."); } };

  return <div className="space-y-4 sm:-mt-4 -mx-4 lg:-mx-14">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-white flex items-center gap-2.5"><span className="material-symbols-outlined text-emerald-400">show_chart</span>관심 종목</h1><p className="text-sm text-text-muted mt-1">관심 등록한 주식 종목의 실시간 시세 및 관련 뉴스를 한눈에 확인하세요.</p></div><SearchBar onAddStock={addStock} /></div>
    {loadingStocks ? <div className="text-text-muted">관심 종목을 불러오는 중...</div> : stocks.length === 0 ? <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center"><p className="text-base font-semibold text-white/60">등록된 관심 종목이 없습니다.</p></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{stocks.map((stock) => <FavoriteStockItem key={stock.symbol} stock={stock} onRemove={removeStock} />)}</div>}
    {stocks.length > 0 && <div className="space-y-4 mt-8"><h2 className="text-lg font-bold text-white">관심 종목 뉴스 모아보기</h2>{newsLoading ? <div>로딩중...</div> : newsError ? <div className="text-red-400">{newsError}</div> : newsList.length === 0 ? <div>관심 종목 관련 뉴스가 없습니다.</div> : <div className="flex flex-col gap-4">{newsList.map((news) => <NewsItem key={news.id} news={news} onLikeClick={likeNews} onScrapClick={scrapNews} onCommentCountChange={adjustCommentCount} />)}</div>}</div>}
  </div>;
}
