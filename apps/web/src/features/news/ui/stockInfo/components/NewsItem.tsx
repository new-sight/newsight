import type { NewsItemData } from "../../../hooks/GetStockNews";
import NewsTag from "./NewsTag";

export default function NewsItem({ news }: { news: NewsItemData }) {
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
      <p className="text-xs text-text-muted mt-1">
        {formattedDate} · {source}
      </p>
      {tagList.length > 0 && (
        <div className="flex gap-2 w-full flex-wrap mt-2">
          {tagList.map((tag, idx) => (
            <NewsTag key={idx} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
