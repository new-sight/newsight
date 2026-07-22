import { useEffect, useState } from "react";
import { fetchNewsList } from "../api/news";
import { COUNTRY_OPTIONS, type Country, type NewsCategory } from "../data";

export type CountryStat = {
  country: Country;
  total: number;
  dominant: NewsCategory;
  headline: string;
};

// Enough recent articles per country to estimate a dominant category when no
// category filter is active; each country's totalCount above is still exact.
const SAMPLE_SIZE = 40;

export function useCountryNewsStats(categoryFilter: NewsCategory | "all") {
  const [stats, setStats] = useState<CountryStat[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      COUNTRY_OPTIONS.map((country) =>
        fetchNewsList({
          country,
          category: categoryFilter === "all" ? undefined : categoryFilter,
          page: 0,
          size: SAMPLE_SIZE,
        }),
      ),
    ).then((responses) => {
      if (cancelled) return;
      const next = responses.flatMap((res, i) => {
        if (res.news.length === 0) return [];
        const counts: Partial<Record<NewsCategory, number>> = {};
        res.news.forEach((n) => {
          counts[n.category] = (counts[n.category] ?? 0) + 1;
        });
        const [dominant] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return [
          {
            country: COUNTRY_OPTIONS[i],
            total: res.totalCount,
            dominant: dominant as NewsCategory,
            headline: res.news[0].title,
          },
        ];
      });
      setStats(next);
    });
    return () => {
      cancelled = true;
    };
  }, [categoryFilter]);

  return stats;
}
