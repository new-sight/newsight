import { useRef, useState } from "react";
import Dropdown from "./Dropdown";
import Globe from "./Globe";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  CAT_COLOR_VAR,
  CITY_TO_COUNTRY,
  COUNTRY_OPTIONS,
  NEWS,
  type Country,
  type NewsCategory,
} from "../data";

const PAGE_SIZE = 5;

export default function DashboardPage() {
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | "all">(
    "all",
  );
  const [countryFilter, setCountryFilter] = useState<Country | "all">("all");
  const [page, setPage] = useState(0);
  const rotBarRef = useRef<HTMLDivElement>(null);
  const [rotationDeg, setRotationDeg] = useState(0);

  const filtered = NEWS.filter(
    (n) =>
      (countryFilter === "all" ||
        CITY_TO_COUNTRY[n.location] === countryFilter) &&
      (categoryFilter === "all" || n.category === categoryFilter),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
      <section className="rounded-md border border-border bg-bg-panel p-3.5">
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <div>
            <div className="font-heading text-base font-semibold">
              실시간 글로벌 뉴스 지도
            </div>
          </div>
          <div className="whitespace-nowrap text-[12.5px] text-text-muted">
            오늘 수집 {NEWS.length}건 · 분석완료 {NEWS.length}건
          </div>
        </div>

        <div className="mb-2.5 flex flex-wrap items-center gap-3">
          <Dropdown
            label="카테고리"
            options={CATEGORY_OPTIONS}
            value={categoryFilter}
            labels={CATEGORY_LABELS}
            onChange={(v) => {
              setCategoryFilter(v);
              setPage(0);
            }}
          />
          <Dropdown
            label="국가"
            options={COUNTRY_OPTIONS}
            value={countryFilter}
            onChange={(v) => {
              setCountryFilter(v);
              setPage(0);
            }}
          />

          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[12.5px] tabular-nums text-text-muted">
              {rotationDeg}°
            </span>
            <div
              ref={rotBarRef}
              title="드래그하여 지구본 회전"
              className="relative h-[22px] w-[110px] touch-none cursor-ew-resize rounded-[3px] border border-border bg-bg"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 12px)",
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-accent" />
            </div>
          </div>
        </div>

        <Globe
          countryFilter={countryFilter}
          categoryFilter={categoryFilter}
          rotBarRef={rotBarRef}
          onRotationChange={setRotationDeg}
        />
      </section>

      <section className="flex flex-col rounded-md border border-border bg-bg-panel p-3.5">
        <div className="mb-2.5 flex items-baseline justify-between">
          <div className="font-heading text-base font-semibold">
            뉴스 더보기
          </div>
          <div className="text-[12.5px] text-text-muted">
            {filtered.length}건
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col gap-2">
          {paged.length === 0 && (
            <div className="py-2.5 text-sm text-text-muted/70">
              해당 조건에 맞는 뉴스가 없습니다.
            </div>
          )}
          {paged.map((n, i) => (
            <article
              key={currentPage * PAGE_SIZE + i}
              className="rounded-[3px] border border-white/[0.06] border-l-[3px] bg-bg py-2.5 pr-3 pl-3.5"
              style={{ borderLeftColor: CAT_COLOR_VAR[n.category] }}
            >
              <div className="mb-1.5 flex justify-between gap-2 text-xs text-text-muted">
                <span className="font-mono tracking-wide">
                  {n.source} · {n.location}
                </span>
                <span className="shrink-0 font-mono tabular-nums">
                  {n.minsAgo}분 전
                </span>
              </div>
              <div className="mb-2 text-[15px] leading-snug text-text">
                {n.headline}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="font-mono text-[11px] font-semibold tracking-wide"
                  style={{ color: CAT_COLOR_VAR[n.category] }}
                >
                  {CATEGORY_LABELS[n.category]}
                </span>
                {n.ticker && (
                  <span className="rounded-[3px] border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-xs text-accent">
                    {n.ticker}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-3.5 flex items-center justify-center gap-4 border-t border-border pt-3">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="font-mono text-base text-text disabled:text-text-muted/40"
              aria-label="이전 페이지"
            >
              ‹
            </button>
            <span className="font-mono text-[12.5px] tabular-nums text-text-muted">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="font-mono text-base text-text disabled:text-text-muted/40"
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
