export type NewsCategory =
  | "HEADLINE"
  | "BUSINESS"
  | "TECHNOLOGY"
  | "SCIENCE"
  | "HEALTH";
export type Country = "KOREA" | "USA" | "JAPAN" | "CHINA";

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  HEADLINE: "헤드라인",
  TECHNOLOGY: "기술",
  BUSINESS: "경제",
  SCIENCE: "과학",
  HEALTH: "건강",
};

export const COUNTRY_LABELS: Record<Country, string> = {
  KOREA: "한국",
  USA: "미국",
  JAPAN: "일본",
  CHINA: "중국",
};

// One representative city coordinate per country -- the API only reports
// country, not city, so the globe pins one marker per country.
export const COUNTRY_COORDS: Record<Country, [lat: number, lon: number]> = {
  KOREA: [37.5, 127],
  USA: [40.7, -74],
  JAPAN: [35.7, 139.7],
  CHINA: [31.2, 121.5],
};

export const CAT_COLOR_VAR: Record<NewsCategory, string> = {
  HEADLINE: "var(--color-cat-headline)",
  TECHNOLOGY: "var(--color-cat-tech)",
  BUSINESS: "var(--color-cat-econ)",
  SCIENCE: "var(--color-cat-science)",
  HEALTH: "var(--color-cat-health)",
};

export const CAT_COLOR_HEX: Record<NewsCategory, number> = {
  HEADLINE: 0xef4444,
  TECHNOLOGY: 0x63d6f0,
  BUSINESS: 0xe8b84f,
  SCIENCE: 0x7cd9a0,
  HEALTH: 0xe08cc9,
};

export const CATEGORY_OPTIONS: NewsCategory[] = [
  "HEADLINE",
  "TECHNOLOGY",
  "BUSINESS",
  "SCIENCE",
  "HEALTH",
];
export const COUNTRY_OPTIONS: Country[] = ["KOREA", "CHINA", "JAPAN", "USA"];
