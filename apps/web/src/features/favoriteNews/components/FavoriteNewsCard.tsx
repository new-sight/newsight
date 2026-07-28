import type { ScrappedNews } from "../api/favoriteNews";

interface Props {
  news: ScrappedNews;
  onUnscrap: (id: string) => void;
}

function formatPublishedAt(publishedAt: string) {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return publishedAt;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function FavoriteNewsCard({ news, onUnscrap }: Props) {
  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/10 hover:shadow-md hover:shadow-accent/10 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/10 blur-lg transition-all duration-300 group-hover:bg-accent/20"
      />

      <div className="z-10 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-bold text-white">
          {news.title}
        </h3>
        <button
          type="button"
          onClick={() => onUnscrap(news.id)}
          aria-label="스크랩 해제"
          className="shrink-0 text-yellow-400"
        >
          <span
            className="material-symbols-rounded leading-none"
            style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        </button>
      </div>

      <div className="z-10 mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-white/40">
        <span className="truncate">{news.source}</span>
        <span>·</span>
        <span className="shrink-0">{formatPublishedAt(news.publishedAt)}</span>
      </div>

      <a
        href={news.link}
        target="_blank"
        rel="noreferrer"
        className="z-10 mt-2 flex items-center gap-1 text-xs text-accent hover:opacity-80"
      >
        <span
          className="material-symbols-outlined leading-none"
          style={{ fontSize: "14px" }}
        >
          open_in_new
        </span>
        기사 보기
      </a>
    </div>
  );
}
