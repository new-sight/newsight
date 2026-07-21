import type { Country, NewsCategory } from "../data";
import CategoryLegend from "./CategoryLegend";
import GlobeScene from "./GlobeScene";

export default function Globe({
  countryFilter,
  categoryFilter,
  rotBarRef,
  onRotationChange,
}: {
  countryFilter: Country | "all";
  categoryFilter: NewsCategory | "all";
  rotBarRef: React.RefObject<HTMLDivElement | null>;
  onRotationChange: (deg: number) => void;
}) {
  return (
    <div className="mt-2">
      <GlobeScene
        countryFilter={countryFilter}
        categoryFilter={categoryFilter}
        rotBarRef={rotBarRef}
        onRotationChange={onRotationChange}
      />
      <CategoryLegend />
    </div>
  );
}
