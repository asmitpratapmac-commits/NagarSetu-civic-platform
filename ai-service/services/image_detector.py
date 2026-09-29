"""
Civic-issue image detection service.

Swap-point for real ML: replace `detect()` with an actual vision-model
inference call (download image from image_url, run model, map output classes
to the category/severity vocabulary used across the app).
"""
from models.schemas import DetectImageRequest, DetectImageResponse
from utils.heuristics import detect_image_issue


def detect(payload: DetectImageRequest) -> DetectImageResponse:
    result = detect_image_issue(payload.image_url)
    return DetectImageResponse(**result)
