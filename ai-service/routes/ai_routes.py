import os
from fastapi import APIRouter

from models.schemas import (
    PredictComplaintRequest,
    PredictComplaintResponse,
    DetectImageRequest,
    DetectImageResponse,
    DetectDuplicateRequest,
    DetectDuplicateResponse,
    SummarizeRequest,
    SummarizeResponse,
    HealthResponse,
)
from services import complaint_predictor, image_detector, duplicate_detector, summarizer

router = APIRouter()


@router.post("/predict-complaint", response_model=PredictComplaintResponse)
def predict_complaint(payload: PredictComplaintRequest):
    return complaint_predictor.predict(payload)


@router.post("/detect-image", response_model=DetectImageResponse)
def detect_image(payload: DetectImageRequest):
    return image_detector.detect(payload)


@router.post("/detect-duplicate", response_model=DetectDuplicateResponse)
def detect_duplicate(payload: DetectDuplicateRequest):
    # No persistent complaint store in this stateless service — the Node backend
    # is expected to pass a candidate pool via /predict-complaint's existing_complaints
    # in normal operation. This endpoint exists for direct, ad-hoc duplicate checks
    # against an empty pool (returns no matches) and is ready to accept a pool
    # once the backend is extended to pass one explicitly.
    return duplicate_detector.detect(payload, candidate_pool=[])


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_text(payload: SummarizeRequest):
    return summarizer.summarize(payload)


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        service="nagarsetu-ai-service",
        usingRealModels=os.getenv("USE_REAL_MODELS", "false").lower() == "true",
    )
