import type { ScrappedNews } from '../api/favoriteNews';

interface Props {
  news: ScrappedNews;
  onDelete: (id: string) => void;
}

export default function FavoriteNewsCard({
  news,
  onDelete,
}: Props) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold">{news.title}</h3>

          <p className="text-sm text-gray-500">
            {news.source}
          </p>

          <p className="text-xs text-gray-400">
            {news.publishedAt}
          </p>
        </div>

        <button
          onClick={() => onDelete(news.id)}
          className="text-yellow-500 text-xl"
        >
          ★
        </button>
      </div>

      <a
        href={news.link}
        target="_blank"
        rel="noreferrer"
        className="text-blue-500 text-sm"
      >
        기사 보기
      </a>
    </div>
  );
}