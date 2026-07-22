import { useEffect, useState } from "react";
import { fetchNewsList, type NewsListItem } from "../api/news";
import type { Country, NewsCategory } from "../data";

export const NEWS_PAGE_SIZE = 5;

export function useNewsList(country: Country | "all", category: NewsCategory | "all", page: number) {
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchNewsList({
      country: country === "all" ? undefined : country,
      category: category === "all" ? undefined : category,
      page,
      size: NEWS_PAGE_SIZE,
    }).then((res) => {
      if (cancelled) return;
      setNews(res.news);
      setTotalCount(res.totalCount);
    });
    return () => {
      cancelled = true;
    };
  }, [country, category, page]);

  return { news, totalCount };
}
