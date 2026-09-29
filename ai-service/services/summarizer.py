"""
Complaint text summarization service.

Swap-point for real ML: replace `generate_summary` with a call to a
summarization model/LLM while keeping the same input/output contract.
"""
from models.schemas import SummarizeRequest, SummarizeResponse
from utils.heuristics import generate_summary


def summarize(payload: SummarizeRequest) -> SummarizeResponse:
    summary = generate_summary("", payload.text, max_len=200)
    return SummarizeResponse(summary=summary)
