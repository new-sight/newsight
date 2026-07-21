export type NewsCategory = "headline" | "technology" | "business" | "science" | "health";
export type Country = "한국" | "중국" | "일본" | "미국";

export type NewsItem = {
  source: string;
  location: string;
  category: NewsCategory;
  headline: string;
  ticker: string | null;
  minsAgo: number;
};

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  headline: "🔥 HOT",
  technology: "기술",
  business: "경제",
  science: "과학",
  health: "건강",
};

// ponytail: mock feed until the real ingestion API is wired up
export const NEWS: NewsItem[] = [
  {
    source: "로이터",
    location: "서울",
    category: "technology",
    headline: "삼성전자, 차세대 HBM4 대량 공급 계약 체결 발표",
    ticker: "005930",
    minsAgo: 3,
  },
  {
    source: "블룸버그",
    location: "서울",
    category: "technology",
    headline: "SK하이닉스, AI 서버향 D램 수요 급증에 증설 검토",
    ticker: "000660",
    minsAgo: 8,
  },
  {
    source: "WSJ",
    location: "뉴욕",
    category: "headline",
    headline: "美 연준, 다음 회의서 금리 동결 시사",
    ticker: null,
    minsAgo: 14,
  },
  {
    source: "CNBC",
    location: "실리콘밸리",
    category: "technology",
    headline: "엔비디아, 차세대 AI 가속기 로드맵 공개",
    ticker: "NVDA",
    minsAgo: 22,
  },
  {
    source: "로이터",
    location: "런던",
    category: "business",
    headline: "유럽 2차전지 소재 가격 반등 조짐",
    ticker: null,
    minsAgo: 31,
  },
  {
    source: "니혼게이자이",
    location: "도쿄",
    category: "business",
    headline: "글로벌 해운 운임 3개월 연속 하락",
    ticker: null,
    minsAgo: 39,
  },
  {
    source: "블룸버그",
    location: "상하이",
    category: "headline",
    headline: "중국 경기부양책 발표, 원자재 수요 확대 기대",
    ticker: null,
    minsAgo: 47,
  },
  {
    source: "로이터",
    location: "프랑크푸르트",
    category: "business",
    headline: "유럽 반도체 장비 투자 확대 논의",
    ticker: "AVGO",
    minsAgo: 55,
  },
  {
    source: "연합인포맥스",
    location: "서울",
    category: "business",
    headline: "한미반도체, 차세대 패키징 장비 대규모 수주",
    ticker: "042700",
    minsAgo: 63,
  },
  {
    source: "블룸버그",
    location: "뉴욕",
    category: "technology",
    headline: "AMD, 데이터센터 GPU 점유율 확대 전망",
    ticker: "AMD",
    minsAgo: 71,
  },
  {
    source: "네이처",
    location: "도쿄",
    category: "science",
    headline: "도쿄대 연구진, 상온 작동 양자 소자 개발 성공",
    ticker: null,
    minsAgo: 44,
  },
  {
    source: "로이터헬스",
    location: "뉴욕",
    category: "health",
    headline: "美 FDA, 알츠하이머 치료제 신속 승인",
    ticker: null,
    minsAgo: 58,
  },
];

export const REGION_COORDS: Record<string, [lat: number, lon: number]> = {
  서울: [37.5, 127],
  뉴욕: [40.7, -74],
  런던: [51.5, -0.1],
  도쿄: [35.7, 139.7],
  상하이: [31.2, 121.5],
  프랑크푸르트: [50.1, 8.7],
  실리콘밸리: [37.4, -122.1],
};

// 런던/프랑크푸르트는 country filter 대상에서 제외 -- 전체(미선택) 상태에서만 노출된다.
export const CITY_TO_COUNTRY: Record<string, Country> = {
  서울: "한국",
  뉴욕: "미국",
  실리콘밸리: "미국",
  도쿄: "일본",
  상하이: "중국",
};

export type RegionInfo = {
  name: string;
  dominant: NewsCategory;
  total: number;
  headline: string;
};

export const REGIONS: RegionInfo[] = Object.keys(REGION_COORDS)
  .map((name) => {
    const items = NEWS.filter((n) => n.location === name);
    const counts: Record<NewsCategory, number> = {
      headline: 0,
      technology: 0,
      business: 0,
      science: 0,
      health: 0,
    };
    items.forEach((n) => counts[n.category]++);
    let dominant: NewsCategory = "technology";
    let max = -1;
    (Object.keys(counts) as NewsCategory[]).forEach((cat) => {
      if (counts[cat] > max) {
        max = counts[cat];
        dominant = cat;
      }
    });
    return {
      name,
      dominant,
      total: items.length,
      headline: items[0]?.headline ?? "",
    };
  })
  .filter((r) => r.total > 0);

export const CAT_COLOR_VAR: Record<NewsCategory, string> = {
  headline: "var(--color-cat-headline)",
  technology: "var(--color-cat-tech)",
  business: "var(--color-cat-econ)",
  science: "var(--color-cat-science)",
  health: "var(--color-cat-health)",
};

export const CAT_COLOR_HEX: Record<NewsCategory, number> = {
  headline: 0xc78cf0,
  technology: 0x63d6f0,
  business: 0xe8b84f,
  science: 0x7cd9a0,
  health: 0xe08cc9,
};

// "전체" is not a real option -- deselecting the active chip falls back to it implicitly.
export const CATEGORY_OPTIONS: NewsCategory[] = ["headline", "technology", "business", "science", "health"];
export const COUNTRY_OPTIONS: Country[] = ["한국", "중국", "일본", "미국"];
