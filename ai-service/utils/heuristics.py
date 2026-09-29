"""
Heuristic ("mock") inference engine.

This module is intentionally isolated so that plugging in a real ML model later
only requires changing the functions in this file (or swapping them out for
model.predict(...) calls) — nothing in routes/ or the request/response schemas
needs to change.

Each function returns plain dicts/tuples matching the shape the service layer expects.
"""
import re
from difflib import SequenceMatcher
from typing import Optional, Tuple

CATEGORY_KEYWORDS = {
    "Pothole": ["pothole", "pot hole", "hole in road", "crater"],
    "Damaged Road": ["road damage", "broken road", "cracked road", "road surface", "uneven road"],
    "Garbage / Sanitation": ["garbage", "trash", "waste", "dustbin", "sanitation", "litter", "dump"],
    "Streetlight": ["streetlight", "street light", "lamp post", "light not working", "dark street"],
    "Water Leakage": ["water leak", "leaking pipe", "pipe burst", "water pipeline"],
    "Water Supply": ["no water", "water supply", "water shortage", "water not coming"],
    "Drainage": ["drain", "drainage", "sewage", "waterlogging", "clogged"],
    "Traffic": ["traffic", "signal", "parking", "congestion", "jam"],
    "Public Property Damage": ["broken bench", "damaged property", "vandalism", "public property", "bus stop"],
}

SEVERITY_KEYWORDS = {
    "Critical": ["danger", "accident", "collapsed", "fire", "electrocution", "urgent", "life", "severe injury"],
    "High": ["major", "large", "big", "flooding", "blocked completely", "overflowing"],
    "Medium": ["moderate", "ongoing", "since a week", "days"],
    "Low": ["minor", "small", "slight", "cosmetic"],
}


def classify_category(text: str, provided_category: Optional[str] = None) -> str:
    text_lower = text.lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score

    if scores:
        return max(scores, key=scores.get)
    return provided_category or "Other"


def classify_severity(text: str) -> Tuple[str, float]:
    text_lower = text.lower()
    scores = {}
    for severity, keywords in SEVERITY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[severity] = score

    if scores:
        best = max(scores, key=scores.get)
        confidence = min(0.55 + 0.1 * scores[best], 0.95)
        return best, round(confidence, 2)

    # Default heuristic: longer, more detailed descriptions of persistent issues -> Medium
    return "Medium", 0.55


def generate_summary(title: str, description: str, max_len: int = 160) -> str:
    combined = f"{title}. {description}".strip()
    combined = re.sub(r"\s+", " ", combined)
    if len(combined) <= max_len:
        return combined
    return combined[: max_len - 1].rsplit(" ", 1)[0] + "…"


def recommend_action(category: str, severity: str) -> str:
    urgency = {
        "Critical": "Dispatch an emergency response team within 24 hours.",
        "High": "Schedule inspection and repair crew within 2-3 days.",
        "Medium": "Add to the department's weekly work queue.",
        "Low": "Schedule for routine maintenance rounds.",
    }.get(severity, "Route to the responsible department for assessment.")

    category_note = {
        "Pothole": "Recommend road maintenance team with asphalt patching materials.",
        "Damaged Road": "Recommend structural assessment before resurfacing.",
        "Garbage / Sanitation": "Recommend sanitation truck dispatch and bin replacement if needed.",
        "Streetlight": "Recommend electrical team to inspect wiring and replace bulb/fixture.",
        "Water Leakage": "Recommend water board team to locate and seal the leak source.",
        "Water Supply": "Recommend water board to check pipeline pressure and distribution schedule.",
        "Drainage": "Recommend drainage clearing crew, check for blockages upstream.",
        "Traffic": "Recommend traffic police coordination and signal/signage repair.",
        "Public Property Damage": "Recommend facilities team for repair or replacement.",
    }.get(category, "Recommend manual triage by the relevant department.")

    return f"{urgency} {category_note}"


def compute_similarity(text_a: str, text_b: str) -> float:
    """Simple ratio-based text similarity — swap for embedding cosine similarity later."""
    return round(SequenceMatcher(None, text_a.lower(), text_b.lower()).ratio(), 3)


def find_duplicates(title: str, description: str, existing_complaints: list, threshold: float = 0.55) -> list:
    combined = f"{title} {description}"
    matches = []
    for complaint in existing_complaints:
        other_combined = f"{complaint.title} {complaint.description}"
        similarity = compute_similarity(combined, other_combined)
        if similarity >= threshold:
            matches.append({"id": complaint.id, "similarity": similarity})
    matches.sort(key=lambda m: m["similarity"], reverse=True)
    return matches[:5]


# -------- Image detection (mock) --------
# In production this would run a vision model on the actual image bytes/URL.
# Here we simulate plausible, varied results so the UI and downstream logic
# (category/severity assignment) can be fully exercised without a real model.
IMAGE_ISSUE_PROFILES = [
    {"detectedIssue": "pothole", "category": "Pothole", "severity": "High", "confidence": 0.87},
    {"detectedIssue": "garbage_pile", "category": "Garbage / Sanitation", "severity": "Medium", "confidence": 0.81},
    {"detectedIssue": "damaged_streetlight", "category": "Streetlight", "severity": "Low", "confidence": 0.78},
    {"detectedIssue": "water_leakage", "category": "Water Leakage", "severity": "High", "confidence": 0.84},
    {"detectedIssue": "road_damage", "category": "Damaged Road", "severity": "Medium", "confidence": 0.80},
    {"detectedIssue": "overflowing_drain", "category": "Drainage", "severity": "Critical", "confidence": 0.83},
]


def detect_image_issue(image_url: str) -> dict:
    """
    Deterministic-but-varied mock: picks a profile based on a hash of the URL so the
    same image always returns the same (simulated) result during a demo/testing session.
    """
    index = sum(ord(c) for c in image_url) % len(IMAGE_ISSUE_PROFILES)
    profile = IMAGE_ISSUE_PROFILES[index]
    return {
        **profile,
        "recommendedAction": recommend_action(profile["category"], profile["severity"]),
    }
