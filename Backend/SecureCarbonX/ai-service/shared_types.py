from __future__ import annotations
from dataclasses import dataclass
from typing import List

@dataclass
class Detection:
    label: str
    confidence: float
    bbox: List[float]

@dataclass
class ImpactResult:
    activity: str
    effort: str
    impact_score: int
    impact_level: str
    impact_summary: str
    impact_narrative: str
    detailed_explanation: str
    reasoning: List[str]
    suggestions: List[str]
    confidence: float
    detections: List[Detection]
