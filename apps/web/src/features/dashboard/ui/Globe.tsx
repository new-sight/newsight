import type { Country } from "../data";
import type { CountryStat } from "../hooks/useCountryNewsStats";
import CategoryLegend from "./CategoryLegend";
import GlobeScene from "./GlobeScene";

export default function Globe({
  countryFilter,
  stats,
  rotBarRef,
  onRotationChange,
}: {
  countryFilter: Country | "all";
  stats: CountryStat[];
  rotBarRef: React.RefObject<HTMLDivElement | null>;
  onRotationChange: (deg: number) => void;
}) {
  return (
    <div className="mt-2">
      <GlobeScene
        countryFilter={countryFilter}
        stats={stats}
        rotBarRef={rotBarRef}
        onRotationChange={onRotationChange}
      />
      <CategoryLegend />
    </div>
  );
}
