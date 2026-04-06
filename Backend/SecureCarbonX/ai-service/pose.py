import os
import math
from typing import Any, Dict, List, Optional
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except Exception:
    MEDIAPIPE_AVAILABLE = False

class PoseHandler:
    @staticmethod
    def analyze(image_rgb: Any) -> Dict[str, Any]:
        if not MEDIAPIPE_AVAILABLE:
            # High-Intelligence Fallback: Gemini will handle pose via vision
            return {
                "pose": "dynamic", # Indicates we need to ask the LLM
                "motion_level": "unknown",
                "keypoints": [],
                "error": "MediaPipe missing"
            }

        # Initialize MediaPipe Pose
        mp_pose = mp.solutions.pose
        with mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5) as pose:
            results = pose.process(image_rgb)
            if not results.pose_landmarks:
                return {"pose": "unknown", "motion_level": "none", "keypoints": []}

            landmarks = results.pose_landmarks.landmark
            
            # 1. Posture Classification Logic
            # Bending: Shoulder (11/12) is below or near hip (23/24)
            shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
            hip_y = (landmarks[23].y + landmarks[24].y) / 2
            knee_y = (landmarks[25].y + landmarks[26].y) / 2

            posture = "standing"
            if shoulder_y > hip_y - 0.1:
                posture = "bending"
            if hip_y > knee_y - 0.1:
                posture = "kneeling"
            
            # Simple riding heuristic: legs extended forward / wide
            if abs(landmarks[25].x - landmarks[23].x) > 0.1:
                posture = "riding"

            return {
                "pose": posture,
                "motion_level": "moderate" if posture in ["riding", "bending"] else "low",
                "keypoints": [{"id": i, "x": l.x, "y": l.y, "z": l.z} for i, l in enumerate(landmarks)]
            }
