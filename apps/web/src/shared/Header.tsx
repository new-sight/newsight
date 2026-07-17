import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/icons/logo.svg";
import TickerTape from "./TickerTape";

const NAV_ITEMS = [
  { to: "/", label: "대시보드", end: true },
  { to: "/prediction", label: "주식 예측" },
  { to: "/news", label: "관련 뉴스" },
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
    <>
      <header className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto border-b border-border bg-bg-panel px-4 py-4 sm:gap-6 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src={logo} alt="newsight" className="h-[20px] w-auto" />
          <div className="hidden text-[12.5px] text-text-muted md:block">
            뉴스 기반 주식 시장 예측 플랫폼
          </div>
        </Link>

        <div className="flex shrink-0 flex-nowrap items-center gap-4 sm:gap-10">
          <nav className="flex flex-nowrap items-center gap-3 sm:gap-7">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  "whitespace-nowrap border-b-2 pb-1 text-sm font-semibold " +
                  (isActive
                    ? "border-accent text-text"
                    : "border-transparent text-text-muted")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 whitespace-nowrap font-mono text-[13px] text-text-muted sm:flex">
            <span className="h-[7px] w-[7px] shrink-0 animate-pulse rounded-full bg-up" />
            <span className="tracking-widest">LIVE</span>
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
      <TickerTape />
    </>
  );
}
