import type { Country, NewsCategory } from "../data";

export type NewsListItem = {
  newsId: string;
  title: string;
  source: string;
  country: Country;
  category: NewsCategory;
  publishedAt: string;
  link: string;
  tags: string[];
};

export type NewsListResponse = {
  news: NewsListItem[];
  page: number;
  size: number;
  totalCount: number;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function fetchNewsList(params: {
  country?: Country;
  category?: NewsCategory;
  page?: number;
  size?: number;
}): Promise<NewsListResponse> {
  const query = new URLSearchParams();
  if (params.country) query.set("country", params.country);
  if (params.category) query.set("category", params.category);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));

  const response = await fetch(
    `${API_BASE_URL}/api/news/list?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error("뉴스 리스트를 불러오지 못했습니다.");
  }
  return response.json();
}
