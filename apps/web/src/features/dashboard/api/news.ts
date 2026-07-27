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

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}


// 뉴스 목록 조회
export async function fetchNewsList(params: {
  country?: Country;
  category?: NewsCategory;
  page?: number;
  size?: number;
}): Promise<NewsListResponse> {
  const query = new URLSearchParams();

  if (params.country) {
    query.set("country", params.country);
  }

  if (params.category) {
    query.set("category", params.category);
  }

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


// 댓글 조회
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


// 댓글 작성
export async function postComment(
  newsId: string,
  content: string,
): Promise<NewsComment> {

  const response = await fetch(
    `${API_BASE_URL}/api/news/${newsId}/comments`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    },
  );


  if (!response.ok) {
    throw new Error("댓글 작성에 실패했습니다.");
  }


  return response.json();
}


// 댓글 삭제
export async function deleteComment(
  newsId: string,
  commentId: number,
): Promise<void> {

  const response = await fetch(
    `${API_BASE_URL}/api/news/${newsId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );


  if (!response.ok) {
    throw new Error("댓글 삭제에 실패했습니다.");
  }
}


// 좋아요 토글
export async function toggleLike(
  newsId: string,
): Promise<LikeToggleResult> {

  const response = await fetch(
    `${API_BASE_URL}/api/news/${newsId}/like`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );


  if (!response.ok) {
    throw new Error("좋아요 처리에 실패했습니다.");
  }


  return response.json();
}


// 스크랩 토글
export async function toggleScrap(
  newsId: string,
): Promise<ScrapToggleResult> {

  const response = await fetch(
    `${API_BASE_URL}/api/scraps/news/${newsId}`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );


  if (!response.ok) {
    throw new Error("스크랩 처리에 실패했습니다.");
  }


  return response.json();
}