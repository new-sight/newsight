import os
import pg8000.dbapi
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()


class SupabaseWriter:
    def __init__(
        self,
        host: str = None,
        port: int = None,
        user: str = None,
        password: str = None,
        database: str = None,
    ):
        """
        Supabase PostgreSQL 저장기 초기화 및 연결 설정.
        """
        self.conn_params = {
            "host": host
            or os.getenv("SUPABASE_DB_HOST", "db.your-project-id.supabase.co"),
            "port": int(port or os.getenv("SUPABASE_DB_PORT", 5432)),
            "user": user or os.getenv("SUPABASE_DB_USER", "postgres"),
            "password": password or os.getenv("SUPABASE_DB_PASSWORD", ""),
            "database": database or os.getenv("SUPABASE_DB_NAME", "postgres"),
            "ssl_context": True,  # Supabase SSL 필수 연결 설정
        }
        self._init_db()

    def _init_db(self):
        """
        테이블이 존재하지 않는 경우 자동으로 생성합니다. 기존 테이블이 있다면 필요한 컬럼을 추가합니다.
        """
        create_table_query = """
        CREATE TABLE IF NOT EXISTS news (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            original_title VARCHAR(500),
            summary TEXT,
            link VARCHAR(1000),
            country VARCHAR(100),
            category VARCHAR(100),
            source VARCHAR(200),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """
        alter_table_query = """
        ALTER TABLE news ADD COLUMN IF NOT EXISTS tags TEXT;
        ALTER TABLE news ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITHOUT TIME ZONE;
        ALTER TABLE news ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC;
        ALTER TABLE news ADD COLUMN IF NOT EXISTS country VARCHAR(100);
        ALTER TABLE news ADD COLUMN IF NOT EXISTS category VARCHAR(100);
        ALTER TABLE news ADD COLUMN IF NOT EXISTS source VARCHAR(200);
        """
        conn = None
        try:
            conn = pg8000.dbapi.connect(**self.conn_params)
            cursor = conn.cursor()
            cursor.execute(create_table_query)
            cursor.execute(alter_table_query)
            conn.commit()
            print("[SupabaseWriter] 'news' table checked/created/updated successfully.")
        except Exception as e:
            print(f"[SupabaseWriter] Database connection or initialization failed: {e}")
            print(
                "[SupabaseWriter] Please ensure Supabase credentials are correct and database is accessible."
            )
            if conn:
                conn.rollback()
        finally:
            if conn:
                conn.close()

    def insert_news(
        self,
        news_id: str,
        title: str,
        original_title: str,
        summary: str,
        link: str,
        tags: list = None,
        pub_date: str = None,
        sentiment_score: float = None,
        country: str = None,
        category: str = None,
        source: str = None,
    ) -> bool:
        """
        뉴스 기사 메타데이터를 Supabase 데이터베이스에 저장합니다.
        """
        # 1) 태그 리스트를 콤마 구분 문자열로 변환
        tags_str = ""
        if tags:
            tags_str = ", ".join(
                [t.get("master") or t.get("name") or "" for t in tags if t]
            )

        # 2) 발행 날짜 문자열을 datetime 객체로 변환
        published_at = None
        if pub_date:
            try:
                import email.utils

                parsed = email.utils.parsedate_to_datetime(pub_date)
                published_at = parsed.replace(tzinfo=None)
            except Exception as e:
                print(f"[SupabaseWriter] Failed to parse pub_date '{pub_date}': {e}")

        insert_query = """
        INSERT INTO news (id, title, original_title, summary, link, tags, published_at, sentiment_score, country, category, source, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE 
        SET title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            link = EXCLUDED.link,
            tags = EXCLUDED.tags,
            published_at = EXCLUDED.published_at,
            sentiment_score = EXCLUDED.sentiment_score,
            country = EXCLUDED.country,
            category = EXCLUDED.category,
            source = EXCLUDED.source;
        """
        conn = None
        try:
            conn = pg8000.dbapi.connect(**self.conn_params)
            cursor = conn.cursor()
            cursor.execute(
                insert_query,
                (
                    news_id,
                    title,
                    original_title,
                    summary,
                    link,
                    tags_str,
                    published_at,
                    sentiment_score,
                    country,
                    category,
                    source,
                    datetime.now(),
                ),
            )
            conn.commit()
            print(f"[SupabaseWriter] News inserted successfully (ID: {news_id})")
            return True
        except Exception as e:
            print(f"[SupabaseWriter] Error inserting news into Supabase: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                conn.close()

    def exists_news(self, news_id: str) -> bool:
        """
        뉴스 기사 ID가 이미 Supabase 데이터베이스에 존재하는지 확인합니다.
        """
        select_query = "SELECT 1 FROM news WHERE id = %s LIMIT 1;"
        conn = None
        try:
            conn = pg8000.dbapi.connect(**self.conn_params)
            cursor = conn.cursor()
            cursor.execute(select_query, (news_id,))
            result = cursor.fetchone()
            return result is not None
        except Exception as e:
            print(f"[SupabaseWriter] Error checking news existence: {e}")
            return False
        finally:
            if conn:
                conn.close()
