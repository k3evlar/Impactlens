from __future__ import annotations
import os
import json
import math
from dataclasses import dataclass, asdict
from io import BytesIO
from typing import Any, Dict, List, Tuple
from dotenv import load_dotenv
from PIL import Image

# Import Modular Logic
from pose import PoseHandler
from reasoning import ReasoningLayer
from shared_types import Detection, ImpactResult

# Initial Infrastructure
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except Exception:
    NUMPY_AVAILABLE = False

try:
    from ultralytics import YOLO
except Exception:
    YOLO = None

# Configuration
YOLO_MODEL_NAME = "yolov8m.pt" # Upgraded to Medium for hackathon
_MODEL = None

def load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    if YOLO is None:
        return None
    _MODEL = YOLO(YOLO_MODEL_NAME)
    return _MODEL

class VisionHandler:
    @staticmethod
    def analyze(image: Image.Image) -> Dict[str, Any]:
        model = load_model()
        if not model:
            return {"activity": "unknown", "people_count": 0, "objects": [], "environment": "unknown", "confidence": 0.0}

        results = model.predict(source=image, conf=0.15, verbose=False, device="cpu")
        labels = []
        
        for result in results:
            names = result.names
            boxes = getattr(result, "boxes", None)
            if boxes:
                for box in boxes:
                    label = names.get(int(box.cls.item()), "obj").lower()
                    labels.append(label)

        # Environment Heuristic
        img_arr = np.array(image)
        g_channel = img_arr[:,:,1]
        is_green = np.mean(g_channel > 100) > 0.2
        environment = "outdoor/nature" if is_green else "indoor/urban"

        projects = []
        if any(l in ["bicycle", "motorcycle"] for l in labels): projects.append("cycling")
        if any(l in ["tree", "plant", "flower", "potted plant"] for l in labels): projects.append("planting")
        if any(l in ["bottle", "wine glass", "cup"] for l in labels): projects.append("reusable_usage")

        return {
            "activity": projects[0] if projects else "unknown",
            "people_count": labels.count("person"),
            "objects": list(set(labels)),
            "environment": environment,
            "confidence": 0.8 # Placeholder for yolo confidence
        }

class InferenceEngine:
    @staticmethod
    def infer(vision_data: Dict[str, Any], pose_data: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Clean Inputs
        objects = set(vision_data.get("objects", []))
        pose = pose_data.get("pose", "unknown")
        motion = pose_data.get("motion_level", "low")
        environment = vision_data.get("environment", "unknown")
        people_count = vision_data.get("people_count", 0)
        confidence = vision_data.get("confidence", 0.8)

        activity = "unknown"
        activity_conf = 0.0

        # 2. Activity Inference (Priority-Based)
        if "person" in objects and "bicycle" in objects:
            activity = "cycling"
            activity_conf = 0.9
        elif pose in ["bending", "kneeling"]:
            if "outdoor" in environment:
                activity = "cleaning_or_planting"
                activity_conf = 0.75
            else:
                activity = "indoor_activity"
                activity_conf = 0.6
        elif pose == "walking" or motion in ["moderate", "high"]:
            activity = "walking"
            activity_conf = 0.65
        elif "person" in objects:
            activity = "general_activity"
            activity_conf = 0.4
        else:
            activity = "unknown"
            activity_conf = 0.2

        # 3. Effort Estimation
        if pose in ["bending", "kneeling"] or motion == "high":
            effort = "High"
        elif motion == "moderate" or pose == "walking":
            effort = "Medium"
        else:
            effort = "Low"

        # 4. Impact Base Score
        base_scores = {
            "cycling": 70,
            "walking": 60,
            "cleaning_or_planting": 75,
            "indoor_activity": 50,
            "general_activity": 50,
            "unknown": 40
        }
        impact_score = base_scores.get(activity, 50)

        # 5. Modifiers
        if people_count >= 3:
            impact_score += 5
        if effort == "High":
            impact_score += 10
        elif effort == "Medium":
            impact_score += 5
        if any(env in environment for env in ["outdoor", "road", "park"]):
            impact_score += 5

        # Confidence adjustment
        impact_score = impact_score * (0.8 + 0.2 * confidence)
        impact_score = max(0, min(int(impact_score), 100))

        # 6. Impact Level
        if impact_score >= 85:
            impact_level = "High"
        elif impact_score >= 60:
            impact_level = "Moderate"
        else:
            impact_level = "Low"

        return {
            "activity": activity,
            "activity_confidence": activity_conf,
            "effort": effort,
            "people_count": people_count,
            "objects": list(objects),
            "pose": pose,
            "motion_level": motion,
            "environment": environment,
            "impact_score": impact_score,
            "impact_level": impact_level
        }

def analyze_image(image_bytes: bytes, user_description: str = "", **kwargs) -> Dict[str, Any]:
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        
        # Phase 1: Pure Vision Context (YOLO)
        vision_data = VisionHandler.analyze(image)
        
        # Phase 2: Posture Recognition (MediaPipe/Fallback)
        pose_data = PoseHandler.analyze(image)
        
        # Phase 3: Rule-Based Numerical Baseline (User's Refined Logic)
        structured_data = InferenceEngine.infer(vision_data, pose_data)
        
        # Phase 4: Final AI Reasoning (Gemini Protocol V7)
        report = ReasoningLayer.interpret(image, {
            "user_description": user_description,
            "structured_data": structured_data
        })
        
        # Final Assembly
        final_score = int(report.get("refined_impact_score", structured_data["impact_score"]))
        final_level = "Low"
        if final_score >= 85: final_level = "High"
        elif final_score >= 60: final_level = "Moderate"

        return asdict(ImpactResult(
            activity=report.get("activity", structured_data["activity"]),
            effort=report.get("effort", structured_data["effort"]),
            impact_score=final_score,
            impact_level=final_level,
            impact_summary=report.get("impact_summary", ""),
            impact_narrative=report.get("impact_narrative", ""),
            detailed_explanation=report.get("detailed_explanation", ""),
            reasoning=report.get("reasoning", []),
            suggestions=report.get("suggestions", []),
            confidence=vision_data["confidence"],
            detections=vision_data.get("detections", [])
        ))
    except Exception as e:
        import traceback
        return {"error": "ImpactLens Engine Fault", "detail": str(e), "traceback": traceback.format_exc()}
