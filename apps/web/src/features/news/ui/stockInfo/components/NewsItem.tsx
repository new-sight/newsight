import { useState } from "react";
import type { NewsItemData } from "../../../hooks/GetStockNews";
import NewsTag from "./NewsTag";
import CommentSection from "../../../../dashboard/ui/CommentSection";

export default function NewsItem({
  news,
  onLikeClick,
  onScrapClick,
  onCommentCountChange,
}: {
  news: NewsItemData;
  onLikeClick: (newsId: string) => void;
  onScrapClick: (newsId: string) => void;
  onCommentCountChange: (newsId: string, delta: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);

  const formattedDate = news.published_at
    ? news.published_at.substring(0, 10)
    : "";
  const source = news.source || "알 수 없음";
  const tagList = news.tags
    ? news.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="w-full rounded-xl p-4 bg-gray-600/10 backdrop-blur-md shadow-lg flex flex-col gap-2 border border-border/40 hover:border-accent/40 transition-colors">
      <h3 className="text-lg font-bold text-white leading-snug">
        {news.link ? (
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            {news.title}
          </a>
        ) : (
          news.title
        )}
      </h3>
      <h4 className="text-sm text-text-muted leading-relaxed">
        {news.summary}
      </h4>
      <p className="text-xs text-text-muted">
        {formattedDate} · {source}
      </p>
      {tagList.length > 0 && (
        <div className="flex gap-2 w-full flex-wrap">
          {tagList.map((tag, idx) => (
            <NewsTag key={idx} tag={tag} />
          ))}
        </div>
      )}

      {/* Action Bar (Like, Comment, Link, Scrap) */}
      <div className="flex items-center gap-3 border-t border-white/10 pt-2.5">
        <button
          type="button"
          onClick={() => onLikeClick(news.id)}
          className={`flex items-center gap-1 text-xs transition-colors ${
            news.likedByMe
              ? "text-pink-400 font-semibold"
              : "text-text-muted hover:text-white"
          }`}
        >
          <span
            className="material-symbols-outlined leading-none"
            style={{
              fontSize: "16px",
              fontVariationSettings: news.likedByMe ? "'FILL' 1" : undefined,
            }}
          >
            favorite
          </span>
          {news.likeCount ?? 0}
        </button>

        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
        >
          <span
            className="material-symbols-outlined leading-none"
            style={{ fontSize: "16px" }}
          >
            chat_bubble
          </span>
          {news.commentCount ?? 0}
        </button>

        {news.link && (
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
          >
            <span
              className="material-symbols-outlined leading-none"
              style={{ fontSize: "16px" }}
            >
              open_in_new
            </span>
            바로가기
          </a>
        )}

        <button
          type="button"
          onClick={() => onScrapClick(news.id)}
          aria-label={news.scrappedByMe ? "스크랩 해제" : "스크랩"}
          className={`flex items-center gap-1 text-xs transition-colors ${
            news.link ? "" : "ml-auto"
          } ${news.scrappedByMe ? "text-yellow-400" : "text-text-muted hover:text-white"}`}
        >
          <span
            className="material-symbols-rounded leading-none"
            style={{
              fontSize: "16px",
              fontVariationSettings: news.scrappedByMe ? "'FILL' 1" : undefined,
            }}
          >
            star
          </span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          newsId={news.id}
          onCommentAdded={() => onCommentCountChange(news.id, 1)}
          onCommentDeleted={() => onCommentCountChange(news.id, -1)}
        />
      )}
    </div>
  );
}
