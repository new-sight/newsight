import { Link } from "react-router-dom";
import StockInfo from "./ui/stockInfo/StockInfo";
import StockRelatedNews from "./ui/StockRelatedNews";

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_left_alt
          </span>
          <span>이전으로</span>
        </Link>
      </div>
      {/* 헤더 여백을 제외한 영역을 고정 높이로 하고 페이지 전체 스크롤을 막음 */}
      <div className="flex gap-6 h-[calc(100vh-160px)] overflow-hidden">
        {/* 왼쪽 주식 정보 컬럼 - 독립 세로 스크롤 (제목 고정) */}
        <div className="w-[23rem] shrink-0 h-full flex flex-col">
          <h1 className="text-lg font-semibold text-white tracking-wide mb-2 shrink-0">
            관련 주식 정보
          </h1>
          <div className="flex-1 overflow-x-hidden overflow-y-auto pr-2">
            <StockInfo />
          </div>
        </div>

        {/* 오른쪽 관련 뉴스 컬럼 - 독립 세로 스크롤 */}
        <div className="flex-1 h-full overflow-x-hidden overflow-y-auto pr-2">
          <h1 className="text-lg font-semibold text-white tracking-wide mb-2 shrink-0">
            종목 관련 뉴스
          </h1>
          <StockRelatedNews />
        </div>
      </div>
    </div>
  );
}
