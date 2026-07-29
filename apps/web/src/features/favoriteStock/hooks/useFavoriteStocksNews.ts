import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { NewsItemData } from "../../news/hooks/GetStockNews";

interface FavoriteStock {
  symbol: string;
  korName?: string;
}

export function useFavoriteStocksNews(
  stocks: FavoriteStock[]
) {
  const [newsList, setNewsList] = useState<NewsItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchAll = useCallback(async () => {

    if (stocks.length === 0) {
      setNewsList([]);
      return;
    }


    setLoading(true);
    setError(null);


    try {

      const baseUrl =
        import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};


      const results = await Promise.all(

        stocks.map((stock) =>
          axios
            .get<NewsItemData[]>(
              `${baseUrl}/api/news/list/${stock.symbol}`,
              { headers }
            )
            .then((res) => res.data)
            .catch(() => [])
        )

      );


      const merged = new Map<string, NewsItemData>();


      results
        .flat()
        .forEach((item) => {
          merged.set(item.id, item);
        });



      const sortedNews = Array.from(
        merged.values()
      ).sort((a, b) =>
        (b.published_at || "").localeCompare(
          a.published_at || ""
        )
      );


      setNewsList(sortedNews);


    } catch (err) {

      console.error(
        "관심 종목 뉴스 조회 실패:",
        err
      );

      setError(
        "뉴스 데이터를 불러오지 못했습니다."
      );


    } finally {

      setLoading(false);

    }


  }, [stocks]);



  useEffect(() => {

    const timer = setTimeout(() => {
      fetchAll();
    }, 0);


    return () => {
      clearTimeout(timer);
    };

  }, [fetchAll]);



  return {
    newsList,
    loading,
    error,
    applyLikeResult: (newsId: string, liked: boolean) => {
      setNewsList((previous) =>
        previous.map((news) => {
          if (news.id !== newsId) return news;
          const changed = news.likedByMe !== liked;
          return {
            ...news,
            likedByMe: liked,
            likeCount: Math.max(0, (news.likeCount ?? 0) + (changed ? (liked ? 1 : -1) : 0)),
          };
        }),
      );
    },
    applyScrapResult: (newsId: string, scrapped: boolean) => {
      setNewsList((previous) =>
        previous.map((news) =>
          news.id === newsId ? { ...news, scrappedByMe: scrapped } : news,
        ),
      );
    },
    adjustCommentCount: (newsId: string, delta: number) => {
      setNewsList((previous) =>
        previous.map((news) =>
          news.id === newsId
            ? { ...news, commentCount: Math.max(0, (news.commentCount ?? 0) + delta) }
            : news,
        ),
      );
    },
  };

}



export default useFavoriteStocksNews;
