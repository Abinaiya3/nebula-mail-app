import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nebulamail")

# Parse connection info from URL roughly
import urllib.parse
parsed = urllib.parse.urlparse(DB_URL)
db_name = parsed.path[1:]
user = parsed.username
password = parsed.password
host = parsed.hostname
port = parsed.port

def setup_db():
    print(f"Connecting to PostgreSQL as {user} to create database {db_name}...")
    try:
        # Connect to default 'postgres' database to create new db
        conn = psycopg2.connect(dbname='postgres', user=user, password=password, host=host, port=port)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if db exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute(f"CREATE DATABASE {db_name}")
            print(f"Database {db_name} created successfully.")
        else:
            print(f"Database {db_name} already exists.")
            
        cur.close()
        conn.close()
        
        # Connect to the new database and create tables
        conn = psycopg2.connect(dbname=db_name, user=user, password=password, host=host, port=port)
        cur = conn.cursor()
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            access_token TEXT,
            refresh_token TEXT,
            history_id VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        conn.commit()
        print("Table 'users' created successfully.")
        
        cur.close()
        conn.close()
        print("Database setup complete.")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        print("Make sure PostgreSQL is running and the password in backend/.env is correct.")

if __name__ == "__main__":
    setup_db()
