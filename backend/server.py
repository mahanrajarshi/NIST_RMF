from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone

from data.questions import QUESTIONS, FUNCTIONS, MATURITY_LEVELS
from data.recommendations import INDUSTRY_RECOMMENDATIONS
from data.actions import ACTION_TEMPLATES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---- Models ----
class AssessmentAnswer(BaseModel):
    question_id: str
    score: int = Field(ge=1, le=5)

class AssessmentSubmission(BaseModel):
    industry: str
    organization_name: Optional[str] = "Anonymous"
    answers: List[AssessmentAnswer]

class AssessmentResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    industry: str
    organization_name: str
    overall_score: float
    overall_maturity: str
    function_scores: Dict
    category_scores: Dict
    radar_data: List[Dict]
    priority_actions: List[Dict]
    created_at: str


# ---- Helper Functions ----
def calculate_scores(answers: List[AssessmentAnswer]):
    answer_map = {a.question_id: a.score for a in answers}
    function_scores = {}
    category_scores = {}

    for func in FUNCTIONS:
        func_id = func["id"]
        func_questions = [q for q in QUESTIONS if q["function"] == func_id]
        if not func_questions:
            continue

        func_total = 0
        func_weight = 0
        cat_groups = {}

        for q in func_questions:
            score = answer_map.get(q["id"], 0)
            if score == 0:
                continue
            weight = q.get("weight", 1)
            func_total += score * weight
            func_weight += 5 * weight

            cat = q["category"]
            if cat not in cat_groups:
                cat_groups[cat] = {"total": 0, "max": 0, "name": q["category_name"], "scores": []}
            cat_groups[cat]["total"] += score * weight
            cat_groups[cat]["max"] += 5 * weight
            cat_groups[cat]["scores"].append(score)

        func_pct = round((func_total / func_weight * 100) if func_weight > 0 else 0, 1)
        func_avg = round((func_total / func_weight * 5) if func_weight > 0 else 0, 1)
        function_scores[func_id] = {
            "name": func["name"],
            "code": func["code"],
            "score_pct": func_pct,
            "avg_score": func_avg,
            "maturity": get_maturity_label(func_avg),
            "color": func["color"],
        }

        for cat, data in cat_groups.items():
            cat_pct = round((data["total"] / data["max"] * 100) if data["max"] > 0 else 0, 1)
            cat_avg = round((data["total"] / data["max"] * 5) if data["max"] > 0 else 0, 1)
            category_scores[cat] = {
                "name": data["name"],
                "function": func_id,
                "score_pct": cat_pct,
                "avg_score": cat_avg,
                "maturity": get_maturity_label(cat_avg),
            }

    total_answered = sum(1 for a in answers if a.score > 0)
    total_score = sum(a.score for a in answers)
    max_score = total_answered * 5
    overall_pct = round((total_score / max_score * 100) if max_score > 0 else 0, 1)
    overall_avg = round((total_score / max_score * 5) if max_score > 0 else 0, 1)

    return overall_pct, overall_avg, function_scores, category_scores


def get_maturity_label(avg_score):
    if avg_score <= 1.5:
        return "Initial"
    elif avg_score <= 2.5:
        return "Developing"
    elif avg_score <= 3.5:
        return "Defined"
    elif avg_score <= 4.5:
        return "Managed"
    return "Optimizing"


def build_radar_data(function_scores):
    return [
        {
            "function": data["name"],
            "score": data["score_pct"],
            "fullMark": 100,
        }
        for _, data in function_scores.items()
    ]


def generate_priority_actions(category_scores, answer_map):
    actions = []
    for func_id, categories in ACTION_TEMPLATES.items():
        for cat_code, cat_data in categories.items():
            cat_score = category_scores.get(cat_code, {})
            avg = cat_score.get("avg_score", 0)
            for action in cat_data["actions"]:
                if avg < action["threshold"]:
                    actions.append({
                        "id": str(uuid.uuid4())[:8],
                        "function": func_id,
                        "category": cat_code,
                        "category_name": cat_data["category_name"],
                        "severity": action["severity"],
                        "title": action["title"],
                        "description": action["description"],
                        "timeline": action["timeline"],
                        "resources": action["resources"],
                        "current_score": avg,
                        "target_score": action["threshold"],
                    })

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    actions.sort(key=lambda x: (severity_order.get(x["severity"], 99), x.get("current_score", 0)))
    return actions


# ---- Routes ----
@api_router.get("/")
async def root():
    return {"message": "NIST AI RMF Assessment API"}

@api_router.get("/assessment/questions")
async def get_questions():
    return {
        "functions": FUNCTIONS,
        "questions": QUESTIONS,
        "maturity_levels": MATURITY_LEVELS,
        "total_questions": len(QUESTIONS),
    }

@api_router.get("/assessment/industries")
async def get_industries():
    industries = []
    for key, val in INDUSTRY_RECOMMENDATIONS.items():
        industries.append({
            "id": key,
            "name": val["name"],
            "code": val["code"],
            "regulations": val["regulations"],
            "description": val["description"],
        })
    return {"industries": industries}

@api_router.post("/assessment/submit")
async def submit_assessment(submission: AssessmentSubmission):
    answer_map = {a.question_id: a.score for a in submission.answers}
    overall_pct, overall_avg, function_scores, category_scores = calculate_scores(submission.answers)

    radar_data = build_radar_data(function_scores)
    priority_actions = generate_priority_actions(category_scores, answer_map)

    assessment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    result = {
        "id": assessment_id,
        "industry": submission.industry,
        "organization_name": submission.organization_name,
        "overall_score": overall_pct,
        "overall_maturity": get_maturity_label(overall_avg),
        "function_scores": function_scores,
        "category_scores": category_scores,
        "radar_data": radar_data,
        "priority_actions": priority_actions,
        "answers": [a.model_dump() for a in submission.answers],
        "created_at": now,
    }

    await db.assessments.insert_one({**result, "_id": assessment_id})

    del result["answers"]
    return result

@api_router.get("/assessment/{assessment_id}")
async def get_assessment(assessment_id: str):
    result = await db.assessments.find_one(
        {"id": assessment_id},
        {"_id": 0, "answers": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return result

@api_router.get("/recommendations/{industry}")
async def get_recommendations(industry: str):
    if industry not in INDUSTRY_RECOMMENDATIONS:
        raise HTTPException(status_code=404, detail=f"Industry '{industry}' not found")
    return INDUSTRY_RECOMMENDATIONS[industry]

@api_router.get("/maturity-levels")
async def get_maturity_levels():
    return MATURITY_LEVELS

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
