import { SmallFavoriteStarButton } from "../../../shared/components/FavoriteStarButton";

export interface FavoriteStockBoxProps {
  ticker: string;
  companyName: string;
  stockPrice?: number;
  changePercent?: number;
  currency?: string;
  loading?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export default function FavoriteStockBox({
  ticker,
  companyName,
  stockPrice = 0,
  changePercent = 0,
  currency,
  loading = false,
  onRemove,
  onClick,
}: FavoriteStockBoxProps) {
  const currUpper = currency?.toUpperCase();

  // 한국 주식 여부 판단 (KRW 통화, 6자리 숫자 코드, .KS/.KQ 확장 티커)
  const isKorean =
    currUpper === "KRW" ||
    ticker.endsWith(".KS") ||
    ticker.endsWith(".KQ") ||
    /^\d{6}$/.test(ticker);

  // 일본 주식 여부 판단 (JPY 통화, .T 확장 티커)
  const isJapanese =
    currUpper === "JPY" || ticker.endsWith(".T") || /^\d{4}\.T$/i.test(ticker);

  const formatPrice = (price: number) => {
    if (isKorean) {
      return `₩${Math.round(price).toLocaleString()}`;
    }
    if (isJapanese) {
      return `¥${Math.round(price).toLocaleString()}`;
    }
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/10 hover:shadow-md hover:shadow-accent/10 cursor-pointer overflow-hidden"
    >
      {/* 은은한 백그라운드 글래스 핑크/보라 글로우 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/10 blur-lg transition-all duration-300 group-hover:bg-accent/20"
      />

<<<<<<< HEAD
      {/* 1행: 회사명 & 티커 */}
      <div className="flex items-center gap-1.5 min-w-0 z-10">
        <h3 className="truncate text-xs font-bold text-white">
=======
      {/* 우측 상단 컴팩트 관심 종목 별 버튼 */}
      <SmallFavoriteStarButton
        symbol={ticker}
        initialStarred={true}
        onRemove={onRemove}
        className="absolute top-1 right-1.5 z-20"
      />

      {/* 1행: 회사명 & 티커 (우측 소형 별 아이콘 영역 pr-5) */}
      <div className="flex items-center gap-1.5 min-w-0 z-10 pr-5">
        <h3 className="truncate text-xs font-bold text-white transition-colors group-hover:text-accent">
>>>>>>> bed80c090ccf15d7c2dfaa3c9e70fd6aac56e480
          {companyName || ticker}
        </h3>
        <span className="inline-block shrink-0 rounded bg-accent/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-accent border border-accent/30 shadow-inner">
          {ticker}
        </span>
      </div>

      {/* 2행: 주식 가격 (한국 ₩, 일본 ¥, 미국 $) & 변동률 */}
      <div className="mt-1 flex items-center justify-between z-10 font-mono">
        <div className="text-xs font-bold tracking-tight text-white">
          {loading ? (
            <span className="animate-pulse text-[10px] font-sans text-white/40">
              조회 중...
            </span>
          ) : stockPrice > 0 ? (
            formatPrice(stockPrice)
          ) : (
            "-"
          )}
        </div>

        {!loading && changePercent !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              changePercent > 0
                ? "text-up"
                : changePercent < 0
                  ? "text-down"
                  : "text-white/70"
            }`}
          >
            <span>
              {changePercent > 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
