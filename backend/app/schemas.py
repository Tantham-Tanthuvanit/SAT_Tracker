from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class ScoreBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Test name or identifier")
    date: str = Field(..., description="Date of practice test (YYYY-MM-DD)")
    time_taken_minutes: int = Field(..., gt=0, le=600, description="Time taken in minutes")
    test_type: str = Field("full", description="Type of test: 'full', 'math', or 'english'")
    topic: str = Field(..., min_length=1, max_length=100, description="Topic or section (e.g. Full Test, Math, Reading & Writing)")
    score: int = Field(..., ge=0, le=1600, description="Total score or section score")
    math_score: Optional[int] = Field(None, ge=0, le=800, description="Math sub-score (200-800)")
    rw_score: Optional[int] = Field(None, ge=0, le=800, description="Reading & Writing sub-score (200-800)")
    notes: Optional[str] = Field("", max_length=2000, description="Mistakes review, topics to study, or reflections")

class ScoreCreate(ScoreBase):
    test_type: Optional[str] = Field("full", description="Type of test: 'full', 'math', or 'english'")

class ScoreUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    date: Optional[str] = None
    time_taken_minutes: Optional[int] = Field(None, gt=0, le=600)
    test_type: Optional[str] = None
    topic: Optional[str] = Field(None, min_length=1, max_length=100)
    score: Optional[int] = Field(None, ge=0, le=1600)
    math_score: Optional[int] = Field(None, ge=0, le=800)
    rw_score: Optional[int] = Field(None, ge=0, le=800)
    notes: Optional[str] = Field(None, max_length=2000)

class ScoreResponse(ScoreBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class TopicStat(BaseModel):
    topic: str
    count: int
    avg_score: float
    max_score: int
    min_score: int
    total_time_minutes: int

class TestTypeStat(BaseModel):
    test_type: str
    count: int
    highest_score: Optional[int] = None
    latest_score: Optional[int] = None
    average_score: Optional[float] = None
    score_change: Optional[int] = None

class StatsResponse(BaseModel):
    total_tests: int
    highest_score: Optional[int] = None
    latest_score: Optional[int] = None
    average_score: Optional[float] = None
    total_time_minutes: int = 0
    score_change: Optional[int] = None  # change between most recent test and one before
    highest_math: Optional[int] = None
    highest_rw: Optional[int] = None
    by_type: Dict[str, TestTypeStat] = {}
    topic_breakdown: List[TopicStat] = []

class NetworkInfo(BaseModel):
    hostname: str
    port: int
    local_ips: List[str]
    access_urls: List[str]
