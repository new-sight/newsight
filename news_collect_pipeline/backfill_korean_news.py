"""Translate already stored foreign news titles and summaries into Korean.

Run from the news_collect_pipeline directory:
    python backfill_korean_news.py

The default is a dry run. Add --apply to write translated values to Supabase.
"""

import argparse
import os
from typing import Any

import pg8000.dbapi
from dotenv import load_dotenv

from extractor import NewsExtractor


load_dotenv()


def connect_to_supabase():
    return pg8000.dbapi.connect(
        host=os.getenv("SUPABASE_DB_HOST", "db.your-project-id.supabase.co"),
        port=int(os.getenv("SUPABASE_DB_PORT", 5432)),
        user=os.getenv("SUPABASE_DB_USER", "postgres"),
        password=os.getenv("SUPABASE_DB_PASSWORD", ""),
        database=os.getenv("SUPABASE_DB_NAME", "postgres"),
        ssl_context=True,
    )


def fetch_untranslated_news(connection, limit: int) -> list[dict[str, Any]]:
    query = """
        SELECT id, title, original_title, summary
        FROM news
        WHERE country IN ('USA', 'JAPAN', 'CHINA')
          AND title !~ '[가-힣]'
        ORDER BY published_at DESC NULLS LAST
        LIMIT %s
    """
    with connection.cursor() as cursor:
        cursor.execute(query, (limit,))
        columns = [column[0] for column in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def update_news(
    connection,
    news_id: str,
    original_title: str,
    translated_title: str,
    translated_summary: str,
) -> None:
    query = """
        UPDATE news
        SET original_title = COALESCE(original_title, %s),
            title = %s,
            summary = %s
        WHERE id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(
            query,
            (original_title, translated_title, translated_summary, news_id),
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Backfill Korean translations for foreign news articles."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write translations to Supabase. Without this flag, only preview results.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=100,
        help="Maximum number of untranslated articles to process (default: 100).",
    )
    args = parser.parse_args()

    if args.limit < 1:
        parser.error("--limit must be at least 1")

    connection = connect_to_supabase()
    extractor = NewsExtractor()

    try:
        articles = fetch_untranslated_news(connection, args.limit)
        mode = "APPLY" if args.apply else "DRY RUN"
        print(f"[Backfill] {mode}: {len(articles)} articles selected")

        for index, article in enumerate(articles, start=1):
            original_title = article["original_title"] or article["title"]
            result = extractor.extract_metadata(
                title=original_title,
                content=article["summary"] or "",
            )
            translated_title = result.get("translatedTitle") or original_title
            translated_summary = result.get("summary") or article["summary"] or ""

            print(
                f"[{index}/{len(articles)}] {original_title}\n"
                f"  -> {translated_title}"
            )

            if args.apply:
                update_news(
                    connection,
                    article["id"],
                    original_title,
                    translated_title,
                    translated_summary,
                )
                connection.commit()

        if not args.apply:
            print("[Backfill] Dry run complete. Re-run with --apply to save translations.")
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    main()
