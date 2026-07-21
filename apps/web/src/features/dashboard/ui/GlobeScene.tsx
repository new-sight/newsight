import type { Country, NewsCategory } from "../data";
import { useGlobeScene, webglSupported } from "../hooks/useGlobeScene";
import GlobeBubble from "./GlobeBubble";
import WebglFallback from "./WebglFallback";

export default function GlobeScene({
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
  const { wrapRef, bubbles } = useGlobeScene({
    countryFilter,
    categoryFilter,
    rotBarRef,
    onRotationChange,
  });

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[440px] touch-none cursor-grab active:cursor-grabbing [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:rounded-md"
    >
      {!webglSupported && <WebglFallback />}
      {bubbles.map((b) => (
        <GlobeBubble key={b.name} {...b} />
      ))}
    </div>
  );
}
