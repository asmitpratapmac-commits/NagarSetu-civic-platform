"""
Complaint classification/severity/priority/department-prediction service.

Swap-point for real ML: replace the body of `predict()` with calls to your
trained model(s) while keeping the same input/output contract.
"""
from models.schemas import PredictComplaintRequest, PredictComplaintResponse, DuplicateCandidate
from utils.heuristics import (
    classify_category,
    classify_severity,
    generate_summary,
    recommend_action,
    find_duplicates,
)


def predict(payload: PredictComplaintRequest) -> PredictComplaintResponse:
    combined_text = f"{payload.title} {payload.description}"

    category = classify_category(combined_text, payload.category)
    severity, confidence = classify_severity(combined_text)
    summary = generate_summary(payload.title, payload.description)
    action = recommend_action(category, severity)

    duplicates = find_duplicates(payload.title, payload.description, payload.existing_complaints)

    return PredictComplaintResponse(
        category=category,
        severity=severity,
        confidence=confidence,
        summary=summary,
        recommendedAction=action,
        duplicateCandidates=[DuplicateCandidate(id=d["id"], similarity=d["similarity"]) for d in duplicates],
    )
