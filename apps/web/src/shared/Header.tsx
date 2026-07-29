import { Link, NavLink } from "react-router-dom";
import logo from "../assets/icons/logo.svg";
import TickerTape from "./TickerTape";
import HeaderLoginButton from "../features/login/ui/HeaderLoginButton";

const NAV_ITEMS = [
  { to: "/", label: "대시보드", end: true },
  { to: "/prediction", label: "주식 전망" },
  { to: "/news", label: "관련 뉴스" },
];

export default function Header() {
  return (
    <>
      <header className="relative z-50 flex flex-nowrap items-center justify-between gap-3 border-b border-border bg-bg-panel px-4 py-3 sm:gap-6 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src={logo} alt="newsight" className="h-5 w-auto" />
          <div className="hidden text-[12.5px] text-text-muted md:block">
            뉴스 기반 주식 시장 예측 플랫폼
          </div>
        </Link>

        <div className="flex shrink-0 flex-nowrap items-center gap-4 sm:gap-10">
          <nav className="flex flex-nowrap items-center gap-3 overflow-x-auto sm:gap-7">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  "whitespace-nowrap border-b-2 py-1 text-sm font-semibold transition-colors " +
                  (isActive
                    ? "border-accent text-text"
                    : "border-transparent text-text-muted hover:text-text")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <HeaderLoginButton />
        </div>
      </header>
      <TickerTape />
    </>
  );
}
