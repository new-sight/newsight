import FavoriteNewsCard from './FavoriteNewsCard';
import { useFavoriteNews } from '../hooks/useFavoriteNews';

export default function FavoriteNewsSection() {
  const {
    favoriteNews,
    loading,
    removeFavoriteNews,
  } = useFavoriteNews();

  if (loading) {
    return <div>불러오는 중...</div>;
  }

  if (favoriteNews.length === 0) {
    return <div>스크랩한 뉴스가 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      {favoriteNews.map((news) => (
        <FavoriteNewsCard
          key={news.id}
          news={news}
          onDelete={removeFavoriteNews}
        />
      ))}
    </div>
  );
}