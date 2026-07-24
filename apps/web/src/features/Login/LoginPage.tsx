import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import InputBox from "./ui/InputBox";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!loginId || !password) {
      alert("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("loginId", data.loginId);
        localStorage.setItem("username", data.username);
        alert(`${data.username || data.loginId}님, 환영합니다!`);
        navigate("/");
      } else {
        const errorText = await response.text();
        alert(
          `로그인 실패: ${errorText || "아이디 또는 비밀번호를 확인하세요."}`,
        );
      }
    } catch (err) {
      console.error("로그인 연동 에러:", err);
      alert(
        "서버 연결에 실패했습니다. 백엔드(8080) 실행 상태를 확인해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative -my-6 -mx-[clamp(2rem,9vw,150px)] flex min-h-[calc(100vh-96px)] flex-1 flex-col items-center justify-center overflow-hidden py-6">
      {/* 화사하게 발광하는 accent 보라색 원형 그라데이션 글로우 배경 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/45 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-75 w-75 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/60 blur-[60px]"
      />

      <div className="flex items-center">
        <img src={logo} alt="logo" className="h-10 w-auto" />
        <span className="ml-2 text-3xl font-bold text-white">에 로그인</span>
      </div>
      <div className="mt-4 flex flex-col w-101 items-center justify-center rounded-[20px] bg-bg-panel text-2xl text-white p-6 gap-4">
        <div className="text-white font-bold tracking-widest">로그인</div>
        <InputBox
          id="id"
          label="아이디"
          type="text"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <InputBox
          id="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <div className="flex w-full justify-center items-center text-white">
          <div className="text-sm">아직 회원이 아니신가요? &nbsp;</div>
          <Link
            to="/login/create"
            className="text-accent underline text-sm hover:opacity-80 transition-opacity"
          >
            회원가입
          </Link>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-accent py-3 px-10 font-bold text-white text-lg hover:bg-accent/90 transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </main>
  );
}
