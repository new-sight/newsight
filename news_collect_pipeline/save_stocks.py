import os
import ssl
import pg8000.dbapi
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Bypass macOS SSL verification errors
ssl._create_default_https_context = ssl._create_unverified_context

# Import FinanceDataReader (which is added to requirements)
import FinanceDataReader as fdr

load_dotenv()

class StockLoader:
    def __init__(self):
        self.conn_params = {
            "host": os.getenv("SUPABASE_DB_HOST", "db.your-project-id.supabase.co"),
            "port": int(os.getenv("SUPABASE_DB_PORT", 5432)),
            "user": os.getenv("SUPABASE_DB_USER", "postgres"),
            "password": os.getenv("SUPABASE_DB_PASSWORD", ""),
            "database": os.getenv("SUPABASE_DB_NAME", "postgres"),
            "ssl_context": True,
        }
        self.init_db()

    def init_db(self):
        """
        Creates the 'stock' table in Supabase if it does not already exist.
        """
        create_table_query = """
        CREATE TABLE IF NOT EXISTS stock (
            stock_code VARCHAR(20) PRIMARY KEY,
            stock_name VARCHAR(100) NOT NULL,
            market_type VARCHAR(20),
            industry_category VARCHAR(100),
            country VARCHAR(20) NOT NULL,
            market_cap BIGINT,
            is_active BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """
        conn = None
        try:
            print("[StockLoader] Connecting to Supabase to initialize table...")
            conn = pg8000.dbapi.connect(**self.conn_params)
            cursor = conn.cursor()
            cursor.execute(create_table_query)
            conn.commit()
            print("[StockLoader] 'stock' table initialized successfully.")
        except Exception as e:
            print(f"[StockLoader] Table initialization failed: {e}")
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()

    def save_stocks_batch(self, stocks):
        """
        Inserts/updates stock records in batches.
        """
        query = """
        INSERT INTO stock (
            stock_code, stock_name, market_type, industry_category, 
            country, market_cap, is_active, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (stock_code) DO UPDATE
        SET stock_name = EXCLUDED.stock_name,
            market_type = EXCLUDED.market_type,
            industry_category = EXCLUDED.industry_category,
            country = EXCLUDED.country,
            market_cap = EXCLUDED.market_cap,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at;
        """
        
        conn = None
        try:
            conn = pg8000.dbapi.connect(**self.conn_params)
            cursor = conn.cursor()
            
            batch_size = 500
            now = datetime.now()
            
            for i in range(0, len(stocks), batch_size):
                chunk = stocks[i:i + batch_size]
                data = [
                    (
                        s['stock_code'],
                        s['stock_name'],
                        s['market_type'],
                        s['industry_category'],
                        s['country'],
                        s['market_cap'],
                        s['is_active'],
                        now
                    ) for s in chunk
                ]
                
                cursor.executemany(query, data)
                conn.commit()
                print(f"[StockLoader] Inserted/Updated batch {i // batch_size + 1}: {len(chunk)} rows.")
                
            print(f"[StockLoader] Successfully saved all {len(stocks)} stocks.")
        except Exception as e:
            print(f"[StockLoader] Error during database insertion: {e}")
            if conn:
                conn.rollback()
        finally:
            if conn:
                conn.close()

def fetch_korea_stocks():
    print("[StockLoader] Fetching South Korea stocks...")
    try:
        url = 'http://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13'
        df_kind = pd.read_html(url, header=0, encoding='EUC-KR', flavor='bs4')[0]
        df_kind['Code'] = df_kind['종목코드'].astype(str).str.zfill(6)
        
        df_krx = fdr.StockListing('KRX')
        df_korea = pd.merge(df_krx, df_kind[['Code', '업종']], on='Code', how='left')
        
        records = []
        for _, row in df_korea.iterrows():
            marcap = row.get('Marcap')
            if pd.isna(marcap):
                marcap = None
            else:
                marcap = int(marcap)
                
            sector = row.get('업종')
            if pd.isna(sector):
                sector = None
                
            records.append({
                'stock_code': str(row['Code']),
                'stock_name': str(row['Name']),
                'market_type': str(row['Market']),
                'industry_category': sector,
                'country': 'South Korea',
                'market_cap': marcap,
                'is_active': True
            })
        print(f"[StockLoader] Fetched {len(records)} South Korea stocks.")
        return records
    except Exception as e:
        print(f"[StockLoader] Error fetching South Korea stocks: {e}")
        return []

def fetch_usa_stocks():
    print("[StockLoader] Fetching USA stocks...")
    records = []
    markets = ['NASDAQ', 'NYSE', 'AMEX']
    for market in markets:
        try:
            df = fdr.StockListing(market)
            print(f"[StockLoader] Fetched {len(df)} stocks from {market}")
            for _, row in df.iterrows():
                industry = row.get('Industry')
                if pd.isna(industry):
                    industry = None
                    
                records.append({
                    'stock_code': str(row['Symbol']),
                    'stock_name': str(row['Name']),
                    'market_type': market,
                    'industry_category': industry,
                    'country': 'USA',
                    'market_cap': None,
                    'is_active': True
                })
        except Exception as e:
            print(f"[StockLoader] Error fetching USA market {market}: {e}")
    print(f"[StockLoader] Fetched total {len(records)} USA stocks.")
    return records

def fetch_japan_stocks():
    print("[StockLoader] Fetching Japan stocks...")
    records = []
    try:
        df = fdr.StockListing('TSE')
        print(f"[StockLoader] Fetched {len(df)} stocks from TSE")
        for _, row in df.iterrows():
            industry = row.get('Industry')
            if pd.isna(industry):
                industry = None
                
            records.append({
                'stock_code': str(row['Symbol']),
                'stock_name': str(row['Name']),
                'market_type': 'TSE',
                'industry_category': industry,
                'country': 'Japan',
                'market_cap': None,
                'is_active': True
            })
    except Exception as e:
        print(f"[StockLoader] Error fetching Japan market TSE: {e}")
    print(f"[StockLoader] Fetched total {len(records)} Japan stocks.")
    return records

def main():
    print("==================================================")
    print("[StockLoader] Starting Stock Loader Pipeline")
    print("==================================================")
    
    loader = StockLoader()
    
    all_stocks = []
    all_stocks.extend(fetch_korea_stocks())
    all_stocks.extend(fetch_usa_stocks())
    all_stocks.extend(fetch_japan_stocks())
    
    print(f"\n[StockLoader] Total fetched stocks: {len(all_stocks)}")
    if all_stocks:
        print("[StockLoader] Saving stock records to Supabase...")
        loader.save_stocks_batch(all_stocks)
    else:
        print("[StockLoader] No stocks to save.")
        
    print("==================================================")
    print("[StockLoader] Pipeline Completed")
    print("==================================================")

if __name__ == "__main__":
    main()
