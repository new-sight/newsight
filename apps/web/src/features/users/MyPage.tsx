import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyInfo } from "./api/MyInfo";
import MyPageBox from "./ui/mypage/MyPageBox";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "activity">("profile");
  const [user] = useState(() => {
    return {
      username: localStorage.getItem("username") || "사용자",
      loginId: localStorage.getItem("loginId") || "user",
    };
  });

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-bg-panel text-white rounded-[10px] overflow-hidden">
      {/* 좌측 사이드바 */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-bg-panel p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          {/* 사이드바 메뉴 */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-accent/20 text-accent font-semibold border border-accent/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined text-lg leading-none"
                style={{
                  fontVariationSettings:
                    activeTab === "profile" ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                account_circle
              </span>
              <span>내 정보 관리</span>
            </button>

            <Link
              to="/likes"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span
                className="material-symbols-outlined text-lg text-pink-500 leading-none"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span>좋아요 메뉴</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* 우측 메인 컨텐츠 영역 */}
      <main className="flex-1 bg-bg-panel px-40 pt-15 overflow-y-auto">
        <div className="max-w-4xl space-y-8">
          {/* 헤더 제목 */}
          <div>
            <h1 className="text-2xl font-bold text-white">내 정보</h1>
            <p className="text-sm text-text-muted mt-1">
              회원 기본 정보 및 상태를 확인할 수 있습니다.
            </p>
          </div>

          {/* 회원 프로필 요약 카드 */}
          <div className="w-full rounded-[10px] border border-white/2 bg-white/2 p-6 sm:p-8 flex flex-col gap-3 backdrop-blur-sm shadow-xl">
            <MyPageBox label="아이디" value="ththth****" />
            <MyPageBox label="이름" value="UJuns" />
            <MyPageBox label="이메일" value="asdf@asdf.com" />
            <MyPageBox label="전화번호" value="010-1234-5678" />
            <MyPageBox label="가입일" value="2026-07-24" />
            <MyPageBox label="유저구분" value="일반회원" />
          </div>
        </div>
      </main>
    </div>
  );
}
