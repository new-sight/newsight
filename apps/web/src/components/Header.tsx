import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/icons/logo.svg";

const NAV_ITEMS = [
  { to: "/", label: "대시보드", end: true },
  { to: "/predictions", label: "주식 예측" },
  { to: "/detail", label: "종목 상세" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Header() {
  const now = useClock();

  return (
    <header className="flex flex-wrap items-center justify-between gap-6 border-b border-border bg-bg-panel px-8 py-4">
      <div className="flex items-center gap-3">
        <img src={logo} alt="newsight" className="h-[20px] w-auto" />
        <div className="text-[12.5px] text-text-muted">
          뉴스 기반 주식 시장 예측 플랫폼
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-10">
        <nav className="flex items-center gap-7">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                "border-b-2 pb-1 text-sm font-semibold " +
                (isActive
                  ? "border-accent text-text"
                  : "border-transparent text-text-muted")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 font-mono text-[13px] text-text-muted">
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-up" />
          <span className="tracking-widest">LIVE</span>x
          <span>
            {now.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
