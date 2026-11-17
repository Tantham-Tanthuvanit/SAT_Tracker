import sqlite3
from typing import List, Optional, Dict, Any
from .database import get_db
from .schemas import ScoreCreate, ScoreUpdate, StatsResponse, TopicStat, TestTypeStat

DEFAULT_TOPICS = [
    "Full Test",
    "Math (Full Section)",
    "Math - Algebra",
    "Math - Advanced Math",
    "Math - Problem Solving & Data Analysis",
    "Math - Geometry & Trigonometry",
    "Reading & Writing (Full Section)",
    "Reading & Writing - Information & Ideas",
    "Reading & Writing - Craft & Structure",
    "Reading & Writing - Expression of Ideas",
    "Reading & Writing - Standard English Conventions"
]

MATH_TOPICS = [
    "Math (Full Section)",
    "Math - Algebra",
    "Math - Advanced Math",
    "Math - Problem Solving & Data Analysis",
    "Math - Geometry & Trigonometry"
]

ENGLISH_TOPICS = [
    "Reading & Writing (Full Section)",
    "Reading & Writing - Craft & Structure",
    "Reading & Writing - Information & Ideas",
    "Reading & Writing - Standard English Conventions",
    "Reading & Writing - Expression of Ideas"
]

FULL_TOPICS = [
    "Full Test",
    "College Board Bluebook",
    "Paper SAT Practice Test",
    "Official Practice Test"
]

def create_score(data: ScoreCreate) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Determine test_type if not cleanly provided
        test_type = (data.test_type or "full").lower()
        if test_type not in ["full", "math", "english"]:
            # Infer from topic
            t = (data.topic or "").lower()
            if "math" in t:
                test_type = "math"
            elif "reading" in t or "writing" in t or "english" in t:
                test_type = "english"
            else:
                test_type = "full"

        math_score = data.math_score
        rw_score = data.rw_score

        # Auto-align section scores if logging a single section test
        if test_type == "math":
            if math_score is None:
                math_score = data.score
            rw_score = None
        elif test_type == "english":
            if rw_score is None:
                rw_score = data.score
            math_score = None

        cursor.execute("""
            INSERT INTO scores (name, date, time_taken_minutes, test_type, topic, score, math_score, rw_score, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.name,
            data.date,
            data.time_taken_minutes,
            test_type,
            data.topic,
            data.score,
            math_score,
            rw_score,
            data.notes or ""
        ))
        conn.commit()
        score_id = cursor.lastrowid
        return get_score(score_id)

def get_scores(
    test_type: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    order: str = "ASC"
) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM scores WHERE 1=1"
        params = []

        if test_type and test_type.lower() != "all":
            query += " AND LOWER(test_type) = ?"
            params.append(test_type.lower())

        if topic and topic != "All":
            query += " AND topic = ?"
            params.append(topic)

        if search:
            query += " AND (name LIKE ? OR notes LIKE ? OR topic LIKE ?)"
            s_param = f"%{search}%"
            params.extend([s_param, s_param, s_param])

        if start_date:
            query += " AND date >= ?"
            params.append(start_date)

        if end_date:
            query += " AND date <= ?"
            params.append(end_date)

        order_dir = "DESC" if order.upper() == "DESC" else "ASC"
        query += f" ORDER BY date {order_dir}, id {order_dir}"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_score(score_id: int) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scores WHERE id = ?", (score_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def update_score(score_id: int, data: ScoreUpdate) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        fields = []
        values = []
        update_dict = data.model_dump(exclude_unset=True)

        if "test_type" in update_dict and update_dict["test_type"]:
            update_dict["test_type"] = update_dict["test_type"].lower()

        for key, val in update_dict.items():
            fields.append(f"{key} = ?")
            values.append(val)

        if not fields:
            return get_score(score_id)

        fields.append("updated_at = datetime('now', 'localtime')")
        values.append(score_id)
        query = f"UPDATE scores SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, values)
        conn.commit()
        return get_score(score_id)

def delete_score(score_id: int) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scores WHERE id = ?", (score_id,))
        conn.commit()
        return cursor.rowcount > 0

def get_topics(test_type: Optional[str] = None) -> List[str]:
    with get_db() as conn:
        cursor = conn.cursor()
        if test_type and test_type.lower() != "all":
            cursor.execute("SELECT DISTINCT topic FROM scores WHERE LOWER(test_type) = ? ORDER BY topic ASC", (test_type.lower(),))
        else:
            cursor.execute("SELECT DISTINCT topic FROM scores ORDER BY topic ASC")
        rows = cursor.fetchall()
        db_topics = [row[0] for row in rows if row[0]]

        if test_type and test_type.lower() == "math":
            base = MATH_TOPICS
        elif test_type and test_type.lower() == "english":
            base = ENGLISH_TOPICS
        elif test_type and test_type.lower() == "full":
            base = FULL_TOPICS
        else:
            base = DEFAULT_TOPICS

        all_topics = list(dict.fromkeys(base + db_topics))
        return all_topics

def get_stats() -> StatsResponse:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                COUNT(*) as count,
                MAX(score) as max_score,
                AVG(score) as avg_score,
                SUM(time_taken_minutes) as total_time,
                MAX(math_score) as max_math,
                MAX(rw_score) as max_rw
            FROM scores
        """)
        row = cursor.fetchone()
        count = row["count"] or 0
        if count == 0:
            return StatsResponse(
                total_tests=0,
                highest_score=None,
                latest_score=None,
                average_score=None,
                total_time_minutes=0,
                score_change=None,
                highest_math=None,
                highest_rw=None,
                by_type={},
                topic_breakdown=[]
            )

        total_time = row["total_time"] or 0

        # Overall full tests highest/average
        cursor.execute("SELECT MAX(score) as max_s, AVG(score) as avg_s FROM scores WHERE test_type = 'full'")
        full_row = cursor.fetchone()
        full_max = full_row["max_s"] if full_row else None
        full_avg = round(float(full_row["avg_s"]), 1) if full_row and full_row["avg_s"] is not None else None

        # Overall highest math across both standalone Math tests AND Full Test math subscores
        cursor.execute("""
            SELECT MAX(m) as top_math FROM (
                SELECT score as m FROM scores WHERE test_type = 'math'
                UNION ALL
                SELECT math_score as m FROM scores WHERE math_score IS NOT NULL
            )
        """)
        m_row = cursor.fetchone()
        highest_math = m_row["top_math"] if m_row else None

        # Overall highest english across both standalone English tests AND Full Test rw subscores
        cursor.execute("""
            SELECT MAX(rw) as top_rw FROM (
                SELECT score as rw FROM scores WHERE test_type = 'english'
                UNION ALL
                SELECT rw_score as rw FROM scores WHERE rw_score IS NOT NULL
            )
        """)
        rw_row = cursor.fetchone()
        highest_rw = rw_row["top_rw"] if rw_row else None

        # Latest full test for latest score & change
        cursor.execute("SELECT score FROM scores WHERE test_type = 'full' ORDER BY date DESC, id DESC LIMIT 2")
        recent_full = cursor.fetchall()
        latest_full_score = recent_full[0]["score"] if len(recent_full) > 0 else None
        full_score_change = None
        if len(recent_full) > 1:
            full_score_change = recent_full[0]["score"] - recent_full[1]["score"]

        # If no full tests exist, fall back to any latest score
        if latest_full_score is None:
            cursor.execute("SELECT score FROM scores ORDER BY date DESC, id DESC LIMIT 2")
            recent_any = cursor.fetchall()
            latest_score = recent_any[0]["score"] if len(recent_any) > 0 else None
            score_change = None
            if len(recent_any) > 1:
                score_change = recent_any[0]["score"] - recent_any[1]["score"]
            highest_score = row["max_score"]
            average_score = round(float(row["avg_score"]), 1) if row["avg_score"] is not None else None
        else:
            latest_score = latest_full_score
            score_change = full_score_change
            highest_score = full_max
            average_score = full_avg

        # Breakdown stats for each test_type: full, math, english
        by_type_dict = {}
        for t_type in ["full", "math", "english"]:
            cursor.execute("""
                SELECT 
                    COUNT(*) as count,
                    MAX(score) as max_score,
                    AVG(score) as avg_score
                FROM scores
                WHERE test_type = ?
            """, (t_type,))
            t_row = cursor.fetchone()
            t_count = t_row["count"] or 0
            if t_count > 0:
                # Latest 2 scores for trend within this type
                cursor.execute("""
                    SELECT score FROM scores 
                    WHERE test_type = ? 
                    ORDER BY date DESC, id DESC LIMIT 2
                """, (t_type,))
                t_recent = cursor.fetchall()
                t_latest = t_recent[0]["score"] if len(t_recent) > 0 else None
                t_change = None
                if len(t_recent) > 1:
                    t_change = t_recent[0]["score"] - t_recent[1]["score"]

                by_type_dict[t_type] = TestTypeStat(
                    test_type=t_type,
                    count=t_count,
                    highest_score=t_row["max_score"],
                    latest_score=t_latest,
                    average_score=round(float(t_row["avg_score"]), 1) if t_row["avg_score"] is not None else None,
                    score_change=t_change
                )

        # Topic breakdown
        cursor.execute("""
            SELECT 
                topic,
                COUNT(*) as count,
                AVG(score) as avg_score,
                MAX(score) as max_score,
                MIN(score) as min_score,
                SUM(time_taken_minutes) as total_time
            FROM scores
            GROUP BY topic
            ORDER BY count DESC
        """)
        topic_rows = cursor.fetchall()
        topic_stats = [
            TopicStat(
                topic=t["topic"],
                count=t["count"],
                avg_score=round(float(t["avg_score"]), 1),
                max_score=t["max_score"],
                min_score=t["min_score"],
                total_time_minutes=t["total_time"] or 0
            )
            for t in topic_rows
        ]

        return StatsResponse(
            total_tests=count,
            highest_score=highest_score,
            latest_score=latest_score,
            average_score=average_score,
            total_time_minutes=total_time,
            score_change=score_change,
            highest_math=highest_math,
            highest_rw=highest_rw,
            by_type=by_type_dict,
            topic_breakdown=topic_stats
        )

def seed_sample_data() -> int:
    """Seeds realistic SAT practice test progression data with full, math, and english tests."""
    sample_tests = [
        {
            "name": "College Board Bluebook Test #1",
            "date": "2026-09-05",
            "time_taken_minutes": 134,
            "test_type": "full",
            "topic": "Full Test",
            "score": 1280,
            "math_score": 630,
            "rw_score": 650,
            "notes": "Baseline test. Rushed through Module 2 Math. Vocabulary in RW was tricky."
        },
        {
            "name": "Khan Academy Algebra Quiz 4",
            "date": "2026-09-12",
            "time_taken_minutes": 35,
            "test_type": "math",
            "topic": "Math - Algebra",
            "score": 680,
            "math_score": 680,
            "rw_score": None,
            "notes": "Practiced linear systems and quadratic equations. Good progress with Desmos shortcuts."
        },
        {
            "name": "Erica Meltzer Reading Drill",
            "date": "2026-09-18",
            "time_taken_minutes": 40,
            "test_type": "english",
            "topic": "Reading & Writing - Craft & Structure",
            "score": 690,
            "math_score": None,
            "rw_score": 690,
            "notes": "Words in Context drills. 18/20 questions correct."
        },
        {
            "name": "College Board Bluebook Test #2",
            "date": "2026-09-28",
            "time_taken_minutes": 132,
            "test_type": "full",
            "topic": "Full Test",
            "score": 1360,
            "math_score": 690,
            "rw_score": 670,
            "notes": "Much better pacing! Felt confident on Math Module 1, but geometry questions in Mod 2 need review."
        },
        {
            "name": "UWorld Advanced Math Drill",
            "date": "2026-10-08",
            "time_taken_minutes": 45,
            "test_type": "math",
            "topic": "Math - Advanced Math",
            "score": 730,
            "math_score": 730,
            "rw_score": None,
            "notes": "Polynomial functions and exponents. Solved all without calculator errors."
        },
        {
            "name": "Khan Academy Grammar & Conventions",
            "date": "2026-10-14",
            "time_taken_minutes": 35,
            "test_type": "english",
            "topic": "Reading & Writing - Standard English Conventions",
            "score": 710,
            "math_score": None,
            "rw_score": 710,
            "notes": "Punctuation boundaries and subject-verb agreement. Perfect score on transitions."
        },
        {
            "name": "College Board Bluebook Test #3",
            "date": "2026-10-20",
            "time_taken_minutes": 130,
            "test_type": "full",
            "topic": "Full Test",
            "score": 1440,
            "math_score": 740,
            "rw_score": 700,
            "notes": "Broke 1400 milestone! Math 740 (only missed 3 questions). Transitions and punctuation were solid."
        },
        {
            "name": "Princeton Review Geometry Section",
            "date": "2026-10-29",
            "time_taken_minutes": 38,
            "test_type": "math",
            "topic": "Math - Geometry & Trigonometry",
            "score": 760,
            "math_score": 760,
            "rw_score": None,
            "notes": "Right triangle trig formulas, circle sector areas. Got 100% on circle equation questions."
        },
        {
            "name": "Official RW Practice Module 2 Drill",
            "date": "2026-11-04",
            "time_taken_minutes": 32,
            "test_type": "english",
            "topic": "Reading & Writing - Information & Ideas",
            "score": 730,
            "math_score": None,
            "rw_score": 730,
            "notes": "Hard module text analysis. Improved comprehension speed on historical documents."
        },
        {
            "name": "College Board Bluebook Test #4",
            "date": "2026-11-10",
            "time_taken_minutes": 128,
            "test_type": "full",
            "topic": "Full Test",
            "score": 1510,
            "math_score": 780,
            "rw_score": 730,
            "notes": "Personal Best! Math was near-perfect (780). Reading inferences were spot on. Main focus now: maintaining consistency."
        }
    ]

    with get_db() as conn:
        cursor = conn.cursor()
        count = 0
        for item in sample_tests:
            cursor.execute("""
                INSERT INTO scores (name, date, time_taken_minutes, test_type, topic, score, math_score, rw_score, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["name"],
                item["date"],
                item["time_taken_minutes"],
                item["test_type"],
                item["topic"],
                item["score"],
                item["math_score"],
                item["rw_score"],
                item["notes"]
            ))
            count += 1
        conn.commit()
        return count
