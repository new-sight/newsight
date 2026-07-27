import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchMyInfo, type MyInfoItem } from "./api/MyInfo";
import MyPageBox from "./ui/mypage/MyPageBox";
import FavoriteStock from "../favoriteStock/FavoriteStock";

export default function MyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab =
    searchParams.get("type") || searchParams.get("tab") || "profile";
  const activeTab =
    rawTab === "stock"
      ? "favoriteStock"
      : rawTab === "news"
        ? "favoriteNews"
        : rawTab;

  const [myInfo, setMyInfo] = useState<MyInfoItem | null>(null);
  const [isLikesOpen, setIsLikesOpen] = useState(true);

  const storedLoginId = localStorage.getItem("loginId");
  const storedUsername = localStorage.getItem("username");
  const queryParam = storedLoginId || storedUsername || undefined;

  useEffect(() => {
    fetchMyInfo(queryParam)
      .then((data) => {
        console.log("마이페이지 데이터 수신 성공:", data);
        setMyInfo(data);
      })
      .catch((err) => console.error("마이페이지 정보 조회 실패:", err));
  }, [queryParam]);

  // 가입일 날짜 포맷팅 (ISO 문자열에서 YYYY-MM-DD 추출)
  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt || createdAt === "-") return "-";
    return createdAt.includes("T") ? createdAt.split("T")[0] : createdAt;
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-bg-panel text-white rounded-[10px] overflow-hidden">
      {/* 좌측 사이드바 */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-bg-panel p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          {/* 사이드바 메뉴 */}
          <nav className="space-y-1">
            {/* 1. 내 정보 관리 */}
            <button
              type="button"
              onClick={() => setSearchParams({ tab: "profile" })}
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

            {/* 2. 좋아요 (접기/펼치기 아코디언 메뉴) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsLikesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-lg text-pink-500 leading-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span>좋아요</span>
                </div>
                <span
                  className={`material-symbols-outlined text-base text-white/50 transition-transform duration-200 ${
                    isLikesOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* 하위 메뉴 2가지: 관심 종목, 관심 뉴스 (회색 점선 ㄴ자 연결구조) */}
              {isLikesOpen && (
                <div className="relative ml-1.5 space-y-1 pt-1 transition-all duration-200">
                  {/* 하위 항목 1: 관심 종목 */}
                  <div className="relative flex items-center">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-0 h-1/2 w-4 border-l border-b border-dashed border-white/30 rounded-bl-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchParams({ type: "stock" })}
                      className={`ml-8 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        activeTab === "favoriteStock"
                          ? "bg-accent/20 text-accent font-semibold border border-accent/30"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-sm text-emerald-400 leading-none"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        show_chart
                      </span>
                      <span>관심 종목</span>
                    </button>
                  </div>

                  {/* 하위 항목 2: 관심 뉴스 */}
                  <div className="relative flex items-center">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-0 h-1/2 w-4 border-l border-b border-dashed border-white/30 rounded-bl-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchParams({ type: "news" })}
                      className={`ml-8 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        activeTab === "favoriteNews"
                          ? "bg-accent/20 text-accent font-semibold border border-accent/30"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-sm text-sky-400 leading-none"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        newspaper
                      </span>
                      <span>관심 뉴스</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* 우측 메인 컨텐츠 영역 */}
      <main className="flex-1 bg-bg-panel px-12 lg:px-24 pt-10 overflow-y-auto">
        <div className="max-w-4xl space-y-8">
          {activeTab === "favoriteStock" ? (
            <FavoriteStock />
          ) : activeTab === "favoriteNews" ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400">
                  newspaper
                </span>
                관심 뉴스
              </h1>
              <p className="text-sm text-text-muted">
                스크랩한 뉴스 기사 목록입니다.
              </p>
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/50">
                스크랩된 관심 뉴스가 없습니다.
              </div>
            </div>
          ) : (
            <>
              {/* 헤더 제목 */}
              <div>
                <h1 className="text-2xl font-bold text-white">내 정보</h1>
                <p className="text-sm text-text-muted mt-1">
                  회원 기본 정보 및 상태를 확인할 수 있습니다.
                </p>
              </div>

              {/* 회원 프로필 요약 카드 */}
              <div className="w-full rounded-[10px] border border-white/2 bg-white/2 p-6 sm:p-8 flex flex-col gap-3 backdrop-blur-sm shadow-xl">
                <MyPageBox
                  label="아이디"
                  value={myInfo?.loginId || storedLoginId || "-"}
                />
                <MyPageBox
                  label="이름"
                  value={myInfo?.username || storedUsername || "-"}
                />
                <MyPageBox label="이메일" value={myInfo?.email || "-"} />
                <MyPageBox label="전화번호" value={myInfo?.phone || "-"} />
                <MyPageBox
                  label="가입일"
                  value={formatCreatedAt(myInfo?.createdAt)}
                />
                <MyPageBox
                  label="유저구분"
                  value={myInfo?.role === "ROLE_ADMIN" ? "관리자" : "일반회원"}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
