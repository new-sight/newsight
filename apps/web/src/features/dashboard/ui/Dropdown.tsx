import { useEffect, useRef, useState } from "react";

export default function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  options: T[];
  value: T | "all";
  onChange: (value: T | "all") => void;
  labels?: Record<T, string>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const display = value === "all" ? "전체" : (labels?.[value] ?? value);
  const pick = (v: T | "all") => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="relative inline-flex items-center gap-2 text-[12.5px] font-semibold text-text-muted"
    >
      {label}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-[3px] border border-border bg-white/5 px-2.5 py-1.5 text-[12.5px] font-semibold text-text"
      >
        {display}
        <span
          className={
            "text-[16px] leading-none transition-transform " +
            (open ? "rotate-180" : "")
          }
        >
          ▾
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-10 mt-1 min-w-[120px] overflow-hidden rounded-[4px] border border-border bg-bg-panel py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === "all"}
              onClick={() => pick("all")}
              className={
                "block w-full px-3 py-1.5 text-left text-[12.5px] font-semibold " +
                (value === "all"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:bg-white/5")
              }
            >
              전체
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt}
                onClick={() => pick(opt)}
                className={
                  "block w-full px-3 py-1.5 text-left text-[12.5px] font-semibold " +
                  (value === opt
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:bg-white/5")
                }
              >
                {labels?.[opt] ?? opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
