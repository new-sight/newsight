import { useRef, useState } from "react";
import type { NewsListItem } from "../api/news";
import Dropdown from "./Dropdown";
import Globe from "./Globe";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  COUNTRY_LABELS,
  COUNTRY_OPTIONS,
  type Country,
  type NewsCategory,
} from "../data";
import { useCountryNewsStats } from "../hooks/useCountryNewsStats";

export default function MapSection({
  categoryFilter,
  countryFilter,
  onCategoryChange,
  onCountryChange,
  news,
}: {
  categoryFilter: NewsCategory | "all";
  countryFilter: Country | "all";
  onCategoryChange: (value: NewsCategory | "all") => void;
  onCountryChange: (value: Country | "all") => void;
  news: NewsListItem[];
}) {
  const rotBarRef = useRef<HTMLDivElement>(null);
  const [rotationDeg, setRotationDeg] = useState(0);
  const countryStats = useCountryNewsStats(categoryFilter);

  return (
    <section className="rounded-md border border-border bg-bg-panel p-3.5">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="font-heading text-base font-semibold">
          실시간 글로벌 뉴스 지도
        </div>
      </div>

      <div className="mb-2.5 flex flex-wrap items-center gap-3">
        <Dropdown
          label="카테고리"
          options={CATEGORY_OPTIONS}
          value={categoryFilter}
          labels={CATEGORY_LABELS}
          onChange={onCategoryChange}
        />
        <Dropdown
          label="국가"
          options={COUNTRY_OPTIONS}
          value={countryFilter}
          labels={COUNTRY_LABELS}
          onChange={onCountryChange}
        />

        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-mono text-[12.5px] tabular-nums text-text-muted">
            {rotationDeg}°
          </span>
          <div
            ref={rotBarRef}
            title="드래그하여 지구본 회전"
            className="relative h-5.5 w-27.5 touch-none cursor-ew-resize rounded-[3px] border border-border bg-bg"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 12px)",
            }}
          >
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent" />
          </div>
        </div>
      </div>

      <Globe
        countryFilter={countryFilter}
        stats={countryStats}
        scatterNews={countryFilter === "all" ? [] : news}
        rotBarRef={rotBarRef}
        onRotationChange={setRotationDeg}
      />
    </section>
  );
}
