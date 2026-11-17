import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager

# Store database in data/ directory relative to project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "sat_tracker.db"

def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with get_db() as conn:
        cursor = conn.cursor()
        # Enable WAL mode for better concurrency across multiple network clients
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                time_taken_minutes INTEGER NOT NULL,
                test_type TEXT DEFAULT 'full',
                topic TEXT NOT NULL,
                score INTEGER NOT NULL,
                math_score INTEGER,
                rw_score INTEGER,
                notes TEXT DEFAULT '',
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                updated_at TEXT DEFAULT (datetime('now', 'localtime'))
            );
        """)

        # Migration: ensure test_type column exists
        cursor.execute("PRAGMA table_info(scores);")
        columns = [row[1] for row in cursor.fetchall()]
        if "test_type" not in columns:
            cursor.execute("ALTER TABLE scores ADD COLUMN test_type TEXT DEFAULT 'full';")

        # Migrate existing rows where test_type is 'full' but topic/name is purely Math or English
        cursor.execute("""
            UPDATE scores 
            SET test_type = 'math' 
            WHERE (test_type IS NULL OR test_type = '' OR test_type = 'full')
              AND (topic LIKE '%math%' OR name LIKE '%math%')
              AND (rw_score IS NULL OR rw_score = 0)
              AND score <= 800;
        """)
        cursor.execute("""
            UPDATE scores 
            SET test_type = 'english' 
            WHERE (test_type IS NULL OR test_type = '' OR test_type = 'full')
              AND (topic LIKE '%reading%' OR topic LIKE '%writing%' OR topic LIKE '%english%' OR name LIKE '%english%' OR name LIKE '%reading%')
              AND (math_score IS NULL OR math_score = 0)
              AND score <= 800;
        """)

        # Indexes on date, topic, and test_type for fast queries and charting
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_topic ON scores(topic);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_test_type ON scores(test_type);")
        conn.commit()

@contextmanager
def get_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Auto-initialize database schema on load
init_db()

