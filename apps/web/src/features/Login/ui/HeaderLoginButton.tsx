import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HeaderLoginButton() {
  const [userState, setUserState] = useState<{
    username: string | null;
    loginId: string | null;
  }>(() => {
    const token = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");
    const storedLoginId = localStorage.getItem("loginId");
    if (token) {
      return {
        username: storedUsername || storedLoginId || "사용자",
        loginId: storedLoginId,
      };
    }
    return { username: null, loginId: null };
  });

  const { username, loginId } = userState;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 드롭다운 외부 클릭 시 자동 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginId");
    localStorage.removeItem("username");
    setUserState({ username: null, loginId: null });
    setIsOpen(false);
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  if (username) {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* 드롭다운 트리거 버튼 */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10 cursor-pointer active:scale-95"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-inner">
            {username.charAt(0).toUpperCase()}
          </div>
          <span>{username}님</span>
          <svg
            className={`h-4 w-4 text-white/60 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* 드롭다운 메뉴 박스 */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/15 bg-bg-panel/95 p-2 shadow-2xl backdrop-blur-xl z-9999 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* 유저 프로필 카드 영역 */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 mb-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-accent to-purple-400 font-bold text-white text-sm shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-white">
                  {username}님
                </span>
                {loginId && (
                  <span className="truncate text-xs font-mono text-white/50">
                    @{loginId}
                  </span>
                )}
              </div>
            </div>

            <div className="my-1 border-t border-white/10" />

            {/* 메뉴 항목 1: 내 정보 */}
            <Link
              to="/mypage"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span
                className="material-symbols-outlined text-accent leading-none"
                style={{ fontSize: "18px" }}
              >
                account_circle
              </span>
              <span className="tracking-tight">내 정보</span>
            </Link>

            {/* 메뉴 항목 2: 좋아요 */}
            <Link
              to="/likes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span
                className="material-symbols-outlined text-pink-500 leading-none"
                style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="tracking-tight">좋아요</span>
            </Link>

            <div className="my-1 border-t border-white/10" />

            {/* 메뉴 항목 3: 로그아웃 */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-red-400 leading-none"
                style={{ fontSize: "18px" }}
              >
                logout
              </span>
              <span className="tracking-tight">로그아웃</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to="/login"
      className="rounded-md border border-accent bg-accent px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      로그인
    </Link>
  );
}
