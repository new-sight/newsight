import type { Bubble } from "../hooks/useGlobeScene";

export default function GlobeBubble({ name, headline, x, y, flip }: Bubble) {
  return (
    <div
      className="pointer-events-none absolute z-[5] flex h-[76px] w-[150px] flex-col rounded border border-accent/40 bg-bg-panel/95 px-2.5 py-1.5 text-[12.5px] leading-snug text-text shadow-lg"
      style={{
        left: x,
        top: y,
        transform: flip
          ? "translate(-50%, 8px)"
          : "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <div className="mb-0.5 truncate text-[11px] font-bold text-accent">
        {name}
      </div>
      <div className="line-clamp-2">{headline}</div>
      <div
        className={
          "absolute left-1/2 h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-bg-panel -translate-x-1/2 " +
          (flip ? "-top-[5px] rotate-180" : "-bottom-[5px]")
        }
      />
    </div>
  );
}
