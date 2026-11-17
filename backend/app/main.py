import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .database import init_db
from .schemas import (
    ScoreCreate,
    ScoreUpdate,
    ScoreResponse,
    StatsResponse,
    NetworkInfo,
)
from . import crud
from .network_utils import get_network_details

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on startup
    init_db()
    yield

app = FastAPI(
    title="SAT Practice Tracker API",
    description="Cross-platform API for tracking SAT practice scores across devices on local network",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local network and mobile devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Core API Endpoints -----------------

@app.get("/api/scores", response_model=List[ScoreResponse])
def read_scores(
    test_type: Optional[str] = Query(None, description="Filter by test type ('full', 'math', 'english')"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    search: Optional[str] = Query(None, description="Search in name or notes"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    order: str = Query("ASC", description="Order by date (ASC or DESC)")
):
    return crud.get_scores(
        test_type=test_type,
        topic=topic,
        search=search,
        start_date=start_date,
        end_date=end_date,
        order=order
    )

@app.post("/api/scores", response_model=ScoreResponse, status_code=201)
def create_score(score: ScoreCreate):
    return crud.create_score(score)

@app.get("/api/scores/{score_id}", response_model=ScoreResponse)
def read_score(score_id: int):
    score = crud.get_score(score_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    return score

@app.put("/api/scores/{score_id}", response_model=ScoreResponse)
def update_score(score_id: int, score_update: ScoreUpdate):
    score = crud.update_score(score_id, score_update)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    return score

@app.delete("/api/scores/{score_id}")
def delete_score(score_id: int):
    success = crud.delete_score(score_id)
    if not success:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"message": "Score deleted successfully", "id": score_id}

@app.get("/api/stats", response_model=StatsResponse)
def get_stats():
    return crud.get_stats()

@app.get("/api/topics", response_model=List[str])
def get_topics(test_type: Optional[str] = Query(None, description="Filter by test type")):
    return crud.get_topics(test_type=test_type)

@app.get("/api/network-info", response_model=NetworkInfo)
def get_network_info():
    port = int(os.environ.get("PORT", 8000))
    info = get_network_details(port=port)
    return info

@app.post("/api/seed")
def seed_data():
    count = crud.seed_sample_data()
    return {"message": f"Successfully seeded {count} sample SAT practice tests."}

@app.get("/api/export")
def export_scores():
    scores = crud.get_scores(order="ASC")
    return JSONResponse(
        content=scores,
        headers={"Content-Disposition": "attachment; filename=sat_scores_backup.json"}
    )

@app.post("/api/import")
async def import_scores(file: UploadFile = File(...)):
    import json
    try:
        content = await file.read()
        items = json.loads(content.decode("utf-8"))
        if not isinstance(items, list):
            raise ValueError("File content must be a JSON array of test entries")
        
        imported = 0
        for item in items:
            crud.create_score(ScoreCreate(
                name=item.get("name", "Imported Test"),
                date=item.get("date", "2026-01-01"),
                time_taken_minutes=int(item.get("time_taken_minutes", 60)),
                test_type=item.get("test_type", "full"),
                topic=item.get("topic", "Full Test"),
                score=int(item.get("score", 1200)),
                math_score=item.get("math_score"),
                rw_score=item.get("rw_score"),
                notes=item.get("notes", "")
            ))
            imported += 1
        return {"message": f"Successfully imported {imported} tests."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to import data: {str(e)}")

# ----------------- Serve Frontend Static Build -----------------

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def index():
        return {
            "message": "SAT Practice Tracker API is running!",
            "docs": "/docs",
            "frontend_status": "Frontend not built yet. Run 'npm run build' in frontend directory."
        }
