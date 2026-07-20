import feedparser
import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional

# 국가 정의 (Spring Boot의 TargetCountry 매핑)
TARGET_COUNTRIES = {
    "KOREA": {"gl": "KR", "hl": "ko", "ceid": "KR:ko", "display_name": "대한민국"},
    "CHINA": {"gl": "CN", "hl": "zh-CN", "ceid": "CN:zh-Hans", "display_name": "중국"},
    "USA": {"gl": "US", "hl": "en", "ceid": "US:en", "display_name": "미국"},
    "JAPAN": {"gl": "JP", "hl": "ja", "ceid": "JP:ja", "display_name": "일본"},
    "UK": {"gl": "GB", "hl": "en", "ceid": "GB:en", "display_name": "영국"},
}

# 카테고리 정의 (Spring Boot의 NewsCategory 매핑)
NEWS_CATEGORIES = ["HEADLINE", "BUSINESS", "TECHNOLOGY", "SCIENCE", "HEALTH"]


class GoogleNewsScraper:
    def __init__(self):
        self.html_tag_pattern = re.compile(r"<[^>]*>")

    def build_rss_url(self, country: str, category: str) -> str:
        """
        국가와 카테고리를 기반으로 Google News RSS 피드 URL을 빌드합니다.
        """
        if country not in TARGET_COUNTRIES:
            raise ValueError(f"지원하지 않는 국가입니다: {country}")
        if category not in NEWS_CATEGORIES:
            raise ValueError(f"지원하지 않는 카테고리입니다: {category}")

        c_info = TARGET_COUNTRIES[country]
        gl, hl, ceid = c_info["gl"], c_info["hl"], c_info["ceid"]

        if category == "HEADLINE":
            return f"https://news.google.com/rss?hl={hl}&gl={gl}&ceid={ceid}"
        else:
            return f"https://news.google.com/rss/headlines/section/topic/{category}?hl={hl}&gl={gl}&ceid={ceid}"

    def clean_html(self, raw_html: str) -> str:
        """
        XML/HTML 내 HTML 태그를 제거하고 공백을 정제합니다.
        """
        if not raw_html:
            return ""
        # BeautifulSoup을 이용해 텍스트 정제
        soup = BeautifulSoup(raw_html, "html.parser")
        clean_text = soup.get_text()
        # 여러 개의 공백을 하나로 압축
        clean_text = self.html_tag_pattern.sub("", clean_text)
        return re.sub(r"\s+", " ", clean_text).strip()

    def fetch_news(
        self, country: str, category: str, limit: int = 5
    ) -> List[Dict[str, str]]:
        """
        특정 국가와 카테고리의 Google News RSS 피드를 수집하여 반환합니다.
        """
        rss_url = self.build_rss_url(country, category)
        print(f"[Scraper] Fetching news from: {rss_url}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            # requests를 활용하여 XML을 먼저 다운로드 받음
            response = requests.get(rss_url, headers=headers, timeout=10)
            if response.status_code != 200:
                print(f"[Scraper] HTTP error {response.status_code} fetching feed.")
                return []

            # feedparser로 XML 내용 파싱
            feed = feedparser.parse(response.content)

            # 파싱 디버깅 로그
            if not feed.entries:
                print(
                    f"[Scraper] Warning: Feed entries is empty. Feed structure: {feed.get('bozo_exception', 'No Exception')}"
                )

            items = []
            entries = feed.entries[:limit] if limit else feed.entries

            for entry in entries:
                title = entry.get("title", "")
                link = entry.get("link", "")
                pub_date = entry.get("published", "")

                # description 필드 파싱 및 정제
                raw_desc = entry.get("description", "")
                summary = self.clean_html(raw_desc)

                # 출처(Source) 파싱
                source = ""
                if "source" in entry:
                    source = entry.source.get("title", "")

                items.append(
                    {
                        "title": title,
                        "summary": summary,
                        "link": link,
                        "source": source,
                        "country": country,
                        "category": category,
                        "pubDate": pub_date,
                    }
                )

            print(
                f"[Scraper] Successfully fetched {len(items)} items for {country} - {category}"
            )
            return items

        except Exception as e:
            print(f"[Scraper] Error fetching news: {e}")
            return []


if __name__ == "__main__":
    # 로컬 테스트 코드
    scraper = GoogleNewsScraper()
    test_items = scraper.fetch_news("KOREA", "TECHNOLOGY", limit=3)
    for idx, item in enumerate(test_items):
        print(f"\n[{idx + 1}] {item['title']}")
        print(f"URL: {item['link']}")
        print(f"Summary: {item['summary']}")
        print(f"Source: {item['source']}")
