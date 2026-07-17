# newsight

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, React Router
- Backend: Java, Spring Boot
- Package Manager: pnpm (workspace monorepo, Turborepo)

## Frontend 폴더 구조

기능 단위(feature-based)로 나눕니다. 공통 레이아웃/컴포넌트는 `shared/`, 페이지별 코드는 `features/{기능명}/`에 둡니다.

```
apps/web/src/
├─ App.tsx              # 헤더 + 라우트 아웃렛을 감싸는 루트 레이아웃
├─ main.tsx              # 라우터 엔트리
├─ index.css              # Tailwind 진입점 + 테마 토큰
├─ assets/                # 이미지, 아이콘
├─ shared/                # 여러 페이지에서 공용으로 쓰는 컴포넌트 (Header, TickerTape 등)
└─ features/
   ├─ dashboard/
   │  └─ DashboardPage.tsx
   ├─ prediction/
   │  └─ PredictionPage.tsx
   └─ news/
      └─ NewsPage.tsx
```

각 `features/{기능명}/` 폴더 안에 해당 페이지 전용 UI 컴포넌트나 훅이 생기면 `ui/`, `hooks/`를 만들어 같이 둡니다.

## Git Convention

`{Type}: {설명}` 형식을 사용합니다.

- `Feat`: 새로운 기능 추가
- `Fix`: 버그 수정
- `Setting`: 환경/설정 관련 변경
- `Refactor`: 동작 변화 없는 리팩토링
- `Docs`: 문서 수정
- `Chore`: 빌드, 패키지 등 기타 변경

예시:

```
Feat: 헤더 추가
Setting: 환경 세팅
```

## Branch Naming

`{type}/{기능명}` 형식을 사용합니다.

- `feature/`: 새로운 기능 개발
- `fix/`: 버그 수정
- `refactor/`: 리팩토링
- `chore/`: 기타 작업

예시:

```
feature/header
fix/login-redirect
refactor/ticker-tape
```
