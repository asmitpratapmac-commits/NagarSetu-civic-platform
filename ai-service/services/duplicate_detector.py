"""
Standalone duplicate-detection endpoint service (separate from the duplicate
candidates already returned inline by /predict-complaint, for cases where the
Node backend wants to re-check duplicates against a larger candidate set later).

Swap-point for real ML: replace `compute_similarity` calls in utils/heuristics.py
with sentence-embedding cosine similarity.
"""
from models.schemas import DetectDuplicateRequest, DetectDuplicateResponse, DuplicateMatch
from utils.heuristics import find_duplicates


def detect(payload: DetectDuplicateRequest, candidate_pool: list) -> DetectDuplicateResponse:
    matches = find_duplicates(payload.title, payload.description, candidate_pool)
    return DetectDuplicateResponse(
        duplicates=[DuplicateMatch(id=m["id"], similarity=m["similarity"]) for m in matches]
    )
