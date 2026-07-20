import os
import pg8000.dbapi
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

def migrate():
    # 1. Supabase connection parameters
    supabase_params = {
        "host": os.getenv("SUPABASE_DB_HOST", "db.your-project-id.supabase.co"),
        "port": int(os.getenv("SUPABASE_DB_PORT", 5432)),
        "user": os.getenv("SUPABASE_DB_USER", "postgres"),
        "password": os.getenv("SUPABASE_DB_PASSWORD", ""),
        "database": os.getenv("SUPABASE_DB_NAME", "postgres"),
        "ssl_context": True,
    }

    # 2. Neo4j connection parameters
    neo4j_uri = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "")

    supabase_conn = None
    supabase_cursor = None
    neo4j_driver = None

    try:
        # 3. Connect to Supabase
        print("[Migration] Connecting to Supabase database...")
        supabase_conn = pg8000.dbapi.connect(**supabase_params)
        supabase_cursor = supabase_conn.cursor()

        # Fetch stock data
        print("[Migration] Fetching stock master data from Supabase 'stock' table...")
        select_query = """
        SELECT stock_code, stock_name, market_type, industry_category 
        FROM stock;
        """
        supabase_cursor.execute(select_query)
        rows = supabase_cursor.fetchall()
        
        # Format rows into list of dicts
        stocks = []
        for r in rows:
            stocks.append({
                "stock_code": r[0],
                "stock_name": r[1],
                "market_type": r[2],
                "industry_category": r[3]
            })
            
        total_records = len(stocks)
        print(f"[Migration] Fetched {total_records} stocks successfully.")

        if total_records == 0:
            print("[Migration] No stock records found. Halted migration.")
            return

        # 4. Connect to Neo4j
        print("[Migration] Connecting to Neo4j graph database...")
        neo4j_driver = GraphDatabase.driver(
            neo4j_uri,
            auth=(neo4j_user, neo4j_password),
            max_connection_lifetime=300
        )
        neo4j_driver.verify_connectivity()
        print("[Neo4j] Connected successfully.")

        # 5. Create constraints before inserting data
        print("[Neo4j] Ensuring uniqueness constraints exist...")
        with neo4j_driver.session() as session:
            session.run("CREATE CONSTRAINT FOR (s:Stock) REQUIRE s.ticker IS UNIQUE;")
            session.run("CREATE CONSTRAINT FOR (i:Industry) REQUIRE i.name IS UNIQUE;")
        print("[Neo4j] Uniqueness constraints verified/created.")

        # 6. Bulk Insert using UNWIND in batches of 1,000
        batch_size = 1000
        cypher_query = """
        UNWIND $batch AS row
        MERGE (s:Stock {ticker: row.stock_code})
        SET s.name = row.stock_name,
            s.kor_name = row.stock_name,
            s.market = row.market_type
        
        WITH row, s
        WHERE row.industry_category IS NOT NULL AND row.industry_category <> ''
        MERGE (i:Industry {name: row.industry_category})
        MERGE (s)-[:BELONGS_TO]->(i);
        """

        print(f"[Migration] Starting batch migration to Neo4j (Batch size: {batch_size})...")
        with neo4j_driver.session() as session:
            for i in range(0, total_records, batch_size):
                chunk = stocks[i:i + batch_size]
                
                # Execute query in a write transaction
                session.execute_write(lambda tx: tx.run(cypher_query, batch=chunk))
                print(f"[Migration] Migrated chunk {i // batch_size + 1}: {len(chunk)} rows.")

        print(f"[Migration] Completed successfully. Total migrated records: {total_records}")

    except Exception as e:
        print(f"[Migration] Error occurred during migration: {e}")
    finally:
        # 7. Safe cleanup of database resources
        print("[Migration] Closing database connections...")
        if supabase_cursor:
            try:
                supabase_cursor.close()
            except Exception as ce:
                print(f"[Cleanup] Error closing Supabase cursor: {ce}")
        if supabase_conn:
            try:
                supabase_conn.close()
                print("[Cleanup] Supabase PostgreSQL connection closed.")
            except Exception as ce:
                print(f"[Cleanup] Error closing Supabase connection: {ce}")
        if neo4j_driver:
            try:
                neo4j_driver.close()
                print("[Cleanup] Neo4j driver closed.")
            except Exception as ce:
                print(f"[Cleanup] Error closing Neo4j driver: {ce}")

if __name__ == "__main__":
    migrate()
