import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StockInfo from "./ui/stockInfo/StockInfo";
import StockRelatedNews from "./ui/StockRelatedNews";

export default function NewsPage() {
  const { stockCode } = useParams<{ stockCode: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      navigate(`/news/${trimmed}`);
    }
  };

  if (!stockCode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-xl text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              종목 관련 뉴스 검색
            </h1>
            <p className="text-text-muted text-sm sm:text-base">
              분석하고자 하는 주식의 종목 코드를 입력해 주세요.{" "}
              <br className="hidden sm:inline" />
              해당 종목의 실시간 시세 정보와 관련 뉴스들을 모아서 보여드립니다.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative group w-full">
            <div className="absolute -inset-0.5 bg-linear-to-r from-accent to-up rounded-2xl blur-md opacity-25 transition duration-300"></div>
            <div className="relative flex items-center bg-bg-panel border border-border rounded-xl px-4 py-3 shadow-2xl transition-all duration-300">
              <span className="material-symbols-outlined text-text-muted text-[24px] mr-3 select-none">
                search
              </span>
              <input
                type="text"
                placeholder="주식코드 입력 (예: AAPL, 005930)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent placeholder-text-muted border-none outline-none text-base sm:text-lg font-sans"
                autoFocus
              />
              <button
                type="submit"
                className="ml-3 px-5 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap shadow-md hover:shadow-accent/20"
              >
                검색
              </button>
            </div>
          </form>

          {/* 주요 종목 추천 태그 */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-text-muted text-xs sm:text-sm mr-1">
              주요 종목:
            </span>
            {[
              { code: "AAPL", name: "애플" },
              { code: "TSLA", name: "테슬라" },
              { code: "NVDA", name: "엔비디아" },
              { code: "MSFT", name: "마이크로소프트" },
              { code: "005930", name: "삼성전자" },
              { code: "035420", name: "NAVER" },
            ].map(({ code, name }) => (
              <button
                key={code}
                onClick={() => navigate(`/news/${code}`)}
                className="px-3 py-1.5 bg-bg-panel hover:bg-bg-panel/40 text-text hover:text-white text-xs sm:text-sm rounded-lg border border-border hover:border-accent transition-all cursor-pointer shadow-sm"
              >
                {code}{" "}
                <span className="text-[10px] text-text-muted ml-0.5">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
      {/* 페이지 레벨에서 자연스럽게 스크롤되도록 고정 높이 제거 */}
      <div className="flex gap-6 items-start">
        {/* 왼쪽 주식 정보 컬럼 - 화면(뷰포트)에 고정되어 있으면서 내부 스크롤 지원 */}
        <div className="w-92 shrink-0 sticky top-6 h-[calc(100vh-100px)] flex flex-col">
          <h1 className="text-lg font-semibold text-white tracking-wide mb-2 shrink-0">
            관련 주식 정보
          </h1>
          <div className="flex-1 overflow-x-hidden overflow-y-auto pr-2">
            <StockInfo symbol={stockCode || ""} />
          </div>
        </div>

        {/* 오른쪽 관련 뉴스 컬럼 - 왼쪽 컬럼과 동일하게 뷰포트에 고정되어 내부 스크롤 지원 */}
        <div className="flex-1 sticky top-6 h-[calc(100vh-100px)] flex flex-col">
          <h1 className="text-lg font-semibold text-white tracking-wide mb-2 shrink-0">
            종목 관련 뉴스
          </h1>
          <div className="flex-1 overflow-x-hidden overflow-y-auto pr-2">
            <StockRelatedNews />
          </div>
        </div>
      </div>
    </div>
  );
}
