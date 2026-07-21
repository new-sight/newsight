import NewsTag from "./NewsTag";

export default function NewsItem() {
  return (
    <div className="w-full rounded-xl p-3 bg-gray-600/10 backdrop-blur-md shadow-lg flex flex-col gap-2">
      <h3 className="text-lg font-bold">뉴스 제목</h3>
      <h4 className="text-base text-gray-400">기사 요약 내용</h4>
      <p className="text-sm text-gray-500">2025-12-24 · 연합뉴스</p>
      <div className="flex gap-2 w-full flex-wrap">
        <NewsTag tag="태그123" />
        <NewsTag tag="태그123" />
        <NewsTag tag="태그123" />
        <NewsTag tag="태그123" />
        <NewsTag tag="태그123" />
        <NewsTag tag="태그123" />
        <NewsTag tag="태그123" />
      </div>
    </div>
  );
}
