import os
import sys
import uuid
import email.utils
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

from scraper import GoogleNewsScraper
from llm_filter import NewsLLMFilter
from extractor import NewsExtractor
from supabase_writer import SupabaseWriter
from neo4j_writer import Neo4jWriter

load_dotenv()


def main():
    print("==================================================")
    print("[Main] 오늘자 뉴스 대량 수집 및 AI 온톨로지 저장 파이프라인 가동")
    print("==================================================")

    # 1. 환경 변수로부터 수집 대상 정보 로드 (기본값: 다국어 및 IT/비즈니스 카테고리 설정)
    countries_env = os.getenv("TARGET_COUNTRIES", "KOREA,USA,JAPAN,CHINA")
    categories_env = os.getenv("TARGET_CATEGORIES", "HEADLINE,TECHNOLOGY,BUSINESS")

    target_countries = [c.strip() for c in countries_env.split(",") if c.strip()]
    categories = [cat.strip() for cat in categories_env.split(",") if cat.strip()]

    # 분야별 최대 수집 개수
    collect_limit = 10

    print(f"[설정] 대상 국가: {target_countries}")
    print(f"[설정] 대상 분야: {categories}")
    print(f"[설정] 분야별 최대 수집 개수: {collect_limit}")

    # 2. 컴포넌트 초기화
    scraper = GoogleNewsScraper()
    llm_filter = NewsLLMFilter()
    extractor = NewsExtractor()
    sb_writer = SupabaseWriter()
    neo_writer = Neo4jWriter()

    # 타임존 설정 (기본값: KST (UTC+9))
    tz_offset_hours = int(os.getenv("TIMEZONE_OFFSET", "9"))
    local_tz = timezone(timedelta(hours=tz_offset_hours))

    # 지정한 타임존 기준 오늘 날짜 계산 후 UTC로 변환하여 필터 범위 설정
    today = datetime.now(local_tz)
    start_date_utc = datetime(
        today.year, today.month, today.day, 0, 0, 0, tzinfo=local_tz
    ).astimezone(timezone.utc)
    end_date_utc = datetime(
        today.year, today.month, today.day, 23, 59, 59, tzinfo=local_tz
    ).astimezone(timezone.utc)

    print(
        f"[설정] 오늘자 날짜 필터 범위: {start_date_utc.strftime('%Y-%m-%d %H:%M:%S %Z')} ~ {end_date_utc.strftime('%Y-%m-%d %H:%M:%S %Z')}"
    )

    try:
        for country in target_countries:
            for category in categories:
                print(f"\n[파이프라인] 수집 개시 -> {country} - {category}")

                # 1) 뉴스 피드 수집
                raw_news = scraper.fetch_news(country, category, limit=collect_limit)
                if not raw_news:
                    print(
                        f"[파이프라인] 수집된 뉴스가 없습니다. ({country} - {category})"
                    )
                    continue

                # 2) 오늘자 기사만 날짜 필터링
                today_news = []
                for item in raw_news:
                    pub_date_str = item.get("pubDate", "")
                    if pub_date_str:
                        try:
                            parsed_date = email.utils.parsedate_to_datetime(
                                pub_date_str
                            )
                            # 타임존이 없는 나이브 데이트타임 객체인 경우 UTC 부여
                            if parsed_date.tzinfo is None:
                                parsed_date = parsed_date.replace(tzinfo=timezone.utc)

                            # 지정된 날짜 범위 내 여부 비교 (오늘 하루)
                            if start_date_utc <= parsed_date <= end_date_utc:
                                today_news.append(item)
                            else:
                                # 범위 외 뉴스 제외 로그
                                print(
                                    f"[날짜 필터] 제외됨 (오늘 아님): {item['title']} (발행일: {pub_date_str})"
                                )
                        except Exception as e:
                            # 날짜 파싱 오류 발생 시 오늘 기사로 가정해 안전하게 수집 목록에 포함
                            print(f"[날짜 필터] 발행일 파싱 오류 (수집 포함): {e}")
                            today_news.append(item)
                    else:
                        # 날짜 정보가 없는 경우 안전하게 포함
                        today_news.append(item)

                print(
                    f"[파이프라인] 날짜 필터 결과: {len(raw_news)}개 중 {len(today_news)}개 기사 통과"
                )
                if not today_news:
                    continue

                # 3) 중복 기사 필터링 (LLM 활용)
                print(f"[파이프라인] 중복 뉴스 필터링 진행 중...")
                unique_news = llm_filter.filter_similar_news(today_news)
                print(
                    f"[파이프라인] 중복 제거 결과: {len(today_news)}개 중 {len(unique_news)}개 대표 기사 선정"
                )

                 # 4) 각 고유 뉴스에 대해 상세 요약, 번역 및 온톨로지 정보 추출
                for idx, news_item in enumerate(unique_news):
                    # URL 기반 고유 UUID 생성 및 존재 여부 체크
                    news_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, news_item["link"]))
                    if sb_writer.exists_news(news_uuid):
                        print(f"[파이프라인] 이미 저장된 뉴스이므로 건너뜀 (ID: {news_uuid}, 제목: {news_item['title']})")
                        continue

                    print(f"\n--- [처리 중 {idx+1}/{len(unique_news)}] ---")
                    print(f"원본 제목: {news_item['title']}")

                    # LLM 기반 AI 분석 요청
                    gemma_result = extractor.extract_metadata(
                        title=news_item["title"], content=news_item["summary"]
                    )

                    # Fallback 처리
                    translated_title = (
                        gemma_result.get("translatedTitle") or news_item["title"]
                    )
                    summary = gemma_result.get("summary") or "요약본 생성 불가"
                    sentiment_score = gemma_result.get("sentimentScore")
                    if sentiment_score is not None:
                        sentiment_score = float(sentiment_score)
                    else:
                        sentiment_score = 0.0
                    extracted_tags = gemma_result.get("tags") or []
                    extracted_relations = gemma_result.get("relations") or []

                    # Supabase 저장
                    sb_success = sb_writer.insert_news(
                        news_id=news_uuid,
                        title=translated_title,
                        original_title=news_item["title"],
                        summary=summary,
                        link=news_item["link"],
                        tags=extracted_tags,
                        pub_date=news_item.get("pubDate"),
                        sentiment_score=sentiment_score,
                        country=country,
                        category=category,
                        source=news_item.get("source"),
                    )

                    # Neo4j 저장
                    if sb_success:
                        lang_code = {
                            "KOREA": "ko",
                            "CHINA": "zh",
                            "USA": "en",
                            "JAPAN": "ja",
                            "UK": "en",
                        }.get(news_item.get("country", "KOREA").upper(), "en")
                        neo_success = neo_writer.save_news_ontology(
                            news_id=news_uuid,
                            title=translated_title,
                            summary=summary,
                            link=news_item["link"],
                            tags=extracted_tags,
                            relations=extracted_relations,
                            sentiment_score=sentiment_score,
                            lang_code=lang_code,
                            country=country,
                            category=category,
                            source=news_item.get("source"),
                        )
                        if neo_success:
                            print(
                                f"[파이프라인] Supabase & Neo4j 저장 완료 (ID: {news_uuid})"
                            )
                        else:
                            print(
                                f"[파이프라인] WARNING: Supabase는 저장되었으나 Neo4j 온톨로지 저장 실패 (ID: {news_uuid})"
                            )
                    else:
                        print(
                            f"[파이프라인] ERROR: Supabase 메타데이터 저장 실패로 인해 Neo4j 저장 생략"
                        )

    except Exception as e:
        print(f"[파이프라인] 오류 발생: {e}")
    finally:
        neo_writer.close()
        print("\n==================================================")
        print("[Main] 오늘자 파이프라인 수행 종료 및 자원 반환 완료")
        print("==================================================")


if __name__ == "__main__":
    main()
