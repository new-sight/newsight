import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBox from "./ui/InputBox";

export default function SignUpPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!loginId || !password || !email) {
      alert("아이디, 비밀번호, 이메일은 필수 입력 사항입니다.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId,
          password,
          username: username || loginId,
          email,
          phone,
        }),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다. 로그인해 주세요.");
        navigate("/login");
      } else {
        const errorMsg = await response.text();
        alert(`회원가입 실패: ${errorMsg}`);
      }
    } catch (err) {
      console.error("회원가입 연동 에러:", err);
      alert("서버 연결에 실패했습니다. 백엔드(8080) 실행 상태를 확인해 주세요.");
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
        <span className="ml-2 text-3xl font-bold text-white tracking-widest">
          회원가입
        </span>
      </div>
      <div className="mt-4 flex flex-col w-101 items-center justify-center rounded-[20px] bg-bg-panel text-2xl text-white p-6 gap-4">
        <InputBox
          id="loginId"
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
        />
        <InputBox
          id="confirmPassword"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <InputBox
          id="username"
          label="사용자 이름"
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputBox
          id="email"
          label="이메일"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputBox
          id="phone"
          label="전화번호"
          type="text"
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="mt-4 h-12 w-full rounded-xl bg-accent py-3 px-10 font-bold text-white text-lg hover:bg-accent/90 transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "처리 중..." : "회원가입"}
        </button>
      </div>
    </main>
  );
}
