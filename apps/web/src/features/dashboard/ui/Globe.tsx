import type { NewsListItem } from "../api/news";
import type { Country } from "../data";
import type { CountryStat } from "../hooks/useCountryNewsStats";
import GlobeScene from "./GlobeScene";

export default function Globe({
  countryFilter,
  stats,
  scatterNews,
  rotBarRef,
  onRotationChange,
}: {
  countryFilter: Country | "all";
  stats: CountryStat[];
  scatterNews: NewsListItem[];
  rotBarRef: React.RefObject<HTMLDivElement | null>;
  onRotationChange: (deg: number) => void;
}) {
  return (
    <div className="mt-2">
      <GlobeScene
        countryFilter={countryFilter}
        stats={stats}
        scatterNews={scatterNews}
        rotBarRef={rotBarRef}
        onRotationChange={onRotationChange}
      />
    </div>
  );
}
