from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple

@dataclass
class Detection:
    label: str
    confidence: float
    bbox: List[float]

def infer_activity(
    detections: List[Detection],
    context: Dict[str, float],
    description: str = "",
    project_type: str = "",
) -> Tuple[str, float, str]:
    labels = [d.label for d in detections]
    top_confidence = max([d.confidence for d in detections], default=0.0)
    context_bonus = context.get("outdoor_score", 0.0)
    green_ratio = context.get("green_ratio", 0.0)
    desc = description.lower()
    project = project_type.lower()

    if "bicycle" in labels:
        explanation = "Detected bicycle indicating cycling activity."
        activity_confidence = 0.75 if "person" in labels else 0.65
        return "cycling", activity_confidence, explanation

    if "bottle" in labels:
        explanation = "Detected bottle suggesting reusable bottle usage."
        activity_confidence = 0.70 if "person" in labels else 0.62
        return "reusable_usage", activity_confidence, explanation

    if "person" in labels and "plant" in labels:
        explanation = "Detected person and plant in outdoor context indicating tree planting activity."
        activity_confidence = 0.85 + context_bonus * 0.25
        return "tree_planting", min(0.93, activity_confidence), explanation

    if "plant" in labels and green_ratio > 0.16:
        explanation = "Detected plant with strong greenery context indicating planting activity."
        activity_confidence = 0.78 + context_bonus * 0.2
        return "tree_planting", min(0.9, activity_confidence), explanation

    if (
        green_ratio > 0.18
        and (
            'plant' in desc
            or 'tree' in desc
            or 'reforestation' in project
            or 'planting' in project
            or 'reforestation' in desc
        )
    ):
        explanation = "Strong greenery and outdoor context indicate tree planting activity."
        activity_confidence = 0.80 + green_ratio * 0.2 + context_bonus * 0.1
        return "tree_planting", min(0.92, activity_confidence), explanation

    if green_ratio > 0.22 or context_bonus > 0.22:
        explanation = "Strong greenery and outdoor context indicate environmental activity."
        activity_confidence = 0.68 + green_ratio * 0.3 + context_bonus * 0.2
        return "tree_planting", min(0.88, activity_confidence), explanation

    if "person" in labels and context.get("outdoor_score", 0.0) > 0.18:
        explanation = "Detected person in an outdoor scene suggesting a sustainable action."
        activity_confidence = 0.60 + context_bonus * 0.2
        return "sustainability_action", min(0.75, activity_confidence), explanation

    explanation = "No strong object combination matched a sustainability activity."
    return "unknown", min(0.35, max(0.15, top_confidence)), explanation
