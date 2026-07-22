import { CATEGORY_LABELS, CATEGORY_OPTIONS, CAT_COLOR_VAR } from "../data";

export default function CategoryLegend() {
  return (
    <div className="mt-2.5 flex flex-wrap justify-center gap-3.5 text-[12.5px] text-text-muted">
      {CATEGORY_OPTIONS.map((cat) => (
        <span key={cat} className="inline-flex items-center gap-1.5">
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ backgroundColor: CAT_COLOR_VAR[cat] }}
          />
          {CATEGORY_LABELS[cat]}
        </span>
      ))}
    </div>
  );
}
