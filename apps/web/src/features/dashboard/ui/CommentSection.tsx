import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteComment,
  fetchComments,
  postComment,
  type NewsComment,
} from "../api/news";

function timeAgo(createdAt: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function CommentSection({
  newsId,
  onCommentAdded,
  onCommentDeleted,
}: {
  newsId: string;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}) {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchComments(newsId).then((res) => {
      if (!cancelled) {
        setComments(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [newsId]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await postComment(newsId, content.trim());
      setComments((prev) => [comment, ...prev]);
      setContent("");
      onCommentAdded();
    } catch {
      alert("댓글을 등록하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("댓글을 삭제할까요?")) return;
    try {
      await deleteComment(newsId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentDeleted();
    } catch {
      alert("댓글을 삭제하지 못했습니다.");
    }
  };

  return (
    <div
      className="mt-2.5 flex flex-col gap-2.5 border-t border-white/8 pt-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      {loading && (
        <div className="text-xs text-text-muted/70">불러오는 중...</div>
      )}
      {!loading && comments.length === 0 && (
        <div className="text-xs text-text-muted/70">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </div>
      )}
      {comments.map((c) => (
        <div key={c.id} className="text-[13px] leading-snug">
          <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-text-muted">
            <span className="font-semibold text-text">{c.username}</span>
            <span className="font-mono">{timeAgo(c.createdAt)}</span>
            {c.mine && (
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="ml-auto text-text-muted hover:text-red-400"
              >
                삭제
              </button>
            )}
          </div>
          <div className="text-text">{c.content}</div>
        </div>
      ))}

      {isLoggedIn ? (
        <div className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="댓글을 입력하세요"
            className="min-w-0 flex-1 rounded-[3px] border border-white/10 bg-bg px-2.5 py-1.5 text-[13px] text-text outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="shrink-0 rounded-[3px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            등록
          </button>
        </div>
      ) : (
        <div className="pt-1 text-xs text-text-muted">
          댓글을 작성하려면{" "}
          <Link to="/login" className="text-accent underline">
            로그인
          </Link>
          이 필요합니다.
        </div>
      )}
    </div>
  );
}
