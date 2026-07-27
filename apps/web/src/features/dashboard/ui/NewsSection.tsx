import { useState } from "react";
import type { NewsListItem } from "../api/news";
import { CATEGORY_LABELS, CAT_COLOR_VAR, COUNTRY_LABELS } from "../data";
import { NEWS_PAGE_SIZE } from "../hooks/useNewsList";
import CommentSection from "./CommentSection";

function timeAgo(publishedAt: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(publishedAt).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function NewsSection({
  news,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onLikeClick,
  onScrapClick,
  onCommentCountChange,
}: {
  news: NewsListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLikeClick: (newsId: string) => void;
  onScrapClick: (newsId: string) => void;
  onCommentCountChange: (newsId: string, delta: number) => void;
}) {
  const [expandedNewsIds, setExpandedNewsIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpanded = (newsId: string) => {
    setExpandedNewsIds((prev) => {
      const next = new Set(prev);
      if (next.has(newsId)) {
        next.delete(newsId);
      } else {
        next.add(newsId);
      }
      return next;
    });
  };

  return (
    <section className="flex flex-col rounded-md border border-border bg-bg-panel p-3.5">
      <div className="mb-2.5 flex items-baseline justify-between">
        <div className="font-heading text-base font-semibold">
          뉴스 더보기
        </div>
        <div className="text-[12.5px] text-text-muted">{totalCount}건</div>
      </div>

      <div className="flex min-h-105 flex-col gap-2">
        {news.length === 0 && (
          <div className="py-2.5 text-sm text-text-muted/70">
            해당 조건에 맞는 뉴스가 없습니다.
          </div>
        )}
        {news.map((n) => (
          <div
            key={n.newsId}
            role="button"
            tabIndex={0}
            onClick={() => toggleExpanded(n.newsId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleExpanded(n.newsId);
              }
            }}
            className="cursor-pointer rounded-[3px] border border-white/6 border-l-[3px] bg-bg py-2.5 pr-3 pl-3.5"
            style={{ borderLeftColor: CAT_COLOR_VAR[n.category] }}
          >
            <div className="mb-1.5 flex justify-between gap-2 text-xs text-text-muted">
              <span className="font-mono tracking-wide">
                {n.source} · {COUNTRY_LABELS[n.country]}
              </span>
              <span className="shrink-0 font-mono tabular-nums">
                {timeAgo(n.publishedAt)}
              </span>
            </div>
            <div className="mb-2 text-[15px] leading-snug text-text">
              {n.title}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-mono text-[11px] font-semibold tracking-wide"
                style={{ color: CAT_COLOR_VAR[n.category] }}
              >
                {CATEGORY_LABELS[n.category]}
              </span>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {n.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[3px] bg-white/5 px-1.5 py-0.5 text-[11px] text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3 border-t border-white/8 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLikeClick(n.newsId);
                }}
                className={`flex items-center gap-1 text-xs ${n.likedByMe ? "text-pink-400" : "text-text-muted"}`}
              >
                <span
                  className="material-symbols-outlined leading-none"
                  style={{
                    fontSize: "16px",
                    fontVariationSettings: n.likedByMe ? "'FILL' 1" : undefined,
                  }}
                >
                  favorite
                </span>
                {n.likeCount}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(n.newsId);
                }}
                className="flex items-center gap-1 text-xs text-text-muted"
              >
                <span
                  className="material-symbols-outlined leading-none"
                  style={{ fontSize: "16px" }}
                >
                  chat_bubble
                </span>
                {n.commentCount}
              </button>
              <a
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-text"
              >
                <span
                  className="material-symbols-outlined leading-none"
                  style={{ fontSize: "16px" }}
                >
                  open_in_new
                </span>
                바로가기
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onScrapClick(n.newsId);
                }}
                aria-label={n.scrappedByMe ? "스크랩 해제" : "스크랩"}
                className={`flex items-center ${n.scrappedByMe ? "text-yellow-400" : "text-text-muted"}`}
              >
                <span
                  className="material-symbols-rounded leading-none"
                  style={{
                    fontSize: "16px",
                    fontVariationSettings: n.scrappedByMe ? "'FILL' 1" : undefined,
                  }}
                >
                  star
                </span>
              </button>
            </div>

            {expandedNewsIds.has(n.newsId) && (
              <CommentSection
                newsId={n.newsId}
                onCommentAdded={() => onCommentCountChange(n.newsId, 1)}
                onCommentDeleted={() => onCommentCountChange(n.newsId, -1)}
              />
            )}
          </div>
        ))}
      </div>

      {totalCount > NEWS_PAGE_SIZE && (
        <div className="mt-3.5 flex items-center justify-center gap-4 border-t border-border pt-3">
          <button
            type="button"
            disabled={currentPage <= 0}
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            className="font-mono text-base text-text"
            aria-label="이전 페이지"
          >
            ‹
          </button>
          <span className="font-mono text-[12.5px] tabular-nums text-text-muted">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            className="font-mono text-base text-text"
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
