from pydantic import BaseModel, Field
from typing import List, Optional


class ExistingComplaint(BaseModel):
    id: str
    title: str
    description: str


class PredictComplaintRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    image_url: Optional[str] = None
    existing_complaints: List[ExistingComplaint] = Field(default_factory=list)


class DuplicateCandidate(BaseModel):
    id: str
    similarity: float


class PredictComplaintResponse(BaseModel):
    category: str
    severity: str
    confidence: float
    summary: str
    recommendedAction: str
    duplicateCandidates: List[DuplicateCandidate] = Field(default_factory=list)


class DetectImageRequest(BaseModel):
    image_url: str


class DetectImageResponse(BaseModel):
    detectedIssue: str
    confidence: float
    category: str
    severity: str
    recommendedAction: str


class DetectDuplicateRequest(BaseModel):
    complaint_id: Optional[str] = None
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DuplicateMatch(BaseModel):
    id: str
    similarity: float


class DetectDuplicateResponse(BaseModel):
    duplicates: List[DuplicateMatch] = Field(default_factory=list)


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    summary: str


class HealthResponse(BaseModel):
    status: str
    service: str
    usingRealModels: bool
