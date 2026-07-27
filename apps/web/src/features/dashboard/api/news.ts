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
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  scrappedByMe: boolean;
};

export type NewsListResponse = {
  news: NewsListItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type NewsComment = {
  id: number;
  username: string;
  content: string;
  createdAt: string;
  mine: boolean;
};

export type LikeToggleResult = {
  liked: boolean;
  likeCount: number;
};

export type ScrapToggleResult = {
  scrapped: boolean;
};


const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("뉴스 리스트를 불러오지 못했습니다.");
  }

  return response.json();
}

export async function fetchComments(
  newsId: string,
): Promise<NewsComment[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/news/${newsId}/comments`,
    {
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("댓글을 불러오지 못했습니다.");
  }

  return response.json();
}