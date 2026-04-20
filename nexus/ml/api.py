"""
FastAPI server: inference + feedback + monitoring
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import logging
import time

from ml_pipeline import InferenceServer, FeatureStore
from monitoring import DataDriftDetector, ModelDriftDetector, PerformanceMonitor, FeedbackLoop
from recommendation_engine import RecommendationEngine

app = FastAPI(title="Nexus Ethical Guard API")
logger = logging.getLogger(__name__)

# Initialize
inference = InferenceServer(model_version="v1")
feature_store = FeatureStore()
data_drift = DataDriftDetector()
model_drift = ModelDriftDetector()
perf_monitor = PerformanceMonitor()
feedback_loop = FeedbackLoop()
recommender = RecommendationEngine()

class PredictRequest(BaseModel):
    content: str
    user_id: Optional[str] = None

class PredictResponse(BaseModel):
    therapeutic: float
    harmful: float
    converter: float
    allowed: bool
    confidence: float
    model_version: str

class FeedbackRequest(BaseModel):
    text: str
    predicted_label: int
    correct_label: int
    user_id: str

@app.post("/score")
async def score_post(request: PredictRequest) -> PredictResponse:
    """Score a post for ethical violations"""
    try:
        start = time.time()
        result = inference.predict(request.content)
        latency_ms = (time.time() - start) * 1000

        perf_monitor.log_inference(result['model_version'], latency_ms, success=True)

        return PredictResponse(
            therapeutic=result['therapeutic'],
            harmful=result['harmful'],
            converter=result['converter'],
            allowed=result['allowed'],
            confidence=result['confidence'],
            model_version=result['model_version']
        )
    except Exception as e:
        perf_monitor.log_inference("v1", 0, success=False)
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """User corrects model prediction"""
    feedback_loop.record_correction(
        request.text,
        request.predicted_label,
        request.correct_label,
        request.user_id
    )
    return {"status": "recorded"}

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "model": "v1",
        "feature_store": feature_store.db_path
    }

@app.get("/metrics")
async def get_metrics():
    """Performance metrics"""
    stats = perf_monitor.get_stats("v1")
    data_stats = data_drift.get_stats(hours=24)
    model_accuracy = model_drift.get_feedback_accuracy("v1")

    return {
        "performance": stats,
        "data_distribution": data_stats,
        "model_accuracy_from_feedback": model_accuracy,
        "retrain_needed": feedback_loop.should_retrain(min_corrections=50)
    }

@app.get("/feed/{user_id}")
async def get_personalized_feed(user_id: str, num_posts: int = 10):
    """Get personalized feed: therapeutic content, genuine creators, no engagement-bait"""
    try:
        posts = recommender.recommend(user_id, num_posts=num_posts)
        return {"posts": posts}
    except Exception as e:
        logger.error(f"Feed generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interaction")
async def log_interaction(user_id: str, post_id: str, interaction_type: str):
    """Log user interaction (viewed, liked, shared) for ranking updates"""
    recommender.log_interaction(user_id, post_id, interaction_type)
    return {"status": "logged"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
