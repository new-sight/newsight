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
  value: T[];
  onChange: (value: T[]) => void;
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

  const display =
    value.length === 0
      ? "전체"
      : value.length === 1
        ? (labels?.[value[0]] ?? value[0])
        : `${labels?.[value[0]] ?? value[0]} 외 ${value.length - 1}건`;

  const toggle = (opt: T) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
    );
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
          aria-multiselectable="true"
          className="absolute top-full left-0 z-10 mt-1 min-w-[120px] overflow-hidden rounded-[4px] border border-border bg-bg-panel py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value.length === 0}
              onClick={() => onChange([])}
              className={
                "block w-full px-3 py-1.5 text-left text-[12.5px] font-semibold " +
                (value.length === 0
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
                aria-selected={value.includes(opt)}
                onClick={() => toggle(opt)}
                className={
                  "flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[12.5px] font-semibold " +
                  (value.includes(opt)
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:bg-white/5")
                }
              >
                <span className="w-3 shrink-0">
                  {value.includes(opt) ? "✓" : ""}
                </span>
                {labels?.[opt] ?? opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
