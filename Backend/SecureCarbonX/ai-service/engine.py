from vision_layer import VisionLayer
from activity_layer import ActivityLayer
from impact_layer import ImpactLayer
from verification_layer import VerificationLayer
from narrative_layer import NarrativeLayer

class ImpactLensEngine:
    def __init__(self, api_key: str):
        self.vision       = VisionLayer(api_key=api_key)
        self.activity     = ActivityLayer()
        self.impact       = ImpactLayer()
        self.verification = VerificationLayer()
        self.narrative    = NarrativeLayer(api_key=api_key)

    def analyze(self, image_path: str) -> dict:
        # Step 1: understand the scene
        vision_output = self.vision.analyze(image_path)
        
        if not self._is_vision_consistent(vision_output):
            vision_output = self.vision._yolo_only_fallback(image_path)

        # Step 2: what is actually happening?
        activity_output = self.activity.infer(vision_output)

        # Step 3: how impactful is it?
        impact_output = self.impact.score(activity_output, vision_output)

        # Step 4: is this submission trustworthy?
        verification_output = self.verification.verify(image_path, vision_output)

        # Step 5: explain it (only if accepted)
        what_is_happening = ""
        narrative = ""
        improvements = []
        
        if verification_output["verification"] == "Accepted":
            narrative = self.narrative.generate_narrative(
                activity_output["activity"], impact_output, vision_output
            )
            what_is_happening = self.narrative.generate_what_is_happening(
                vision_output, activity_output["activity"]
            )
            improvements = self.narrative.generate_improvements(
                activity_output["activity"], impact_output, vision_output
            )

        return {
            "activity":             activity_output["activity"],
            "confidence":           activity_output["confidence"],
            "impact_score":         impact_output["impact_score"],
            "impact_level":         impact_output["impact_level"],
            "breakdown":            impact_output["breakdown"],
            "trust_score":          verification_output["trust_score"],
            "verification":         verification_output["verification"],
            "narrative":            narrative,
            "what_is_happening":    what_is_happening,
            "improvements":         improvements,
            "raw": {
                "vision":   vision_output,
                "activity": activity_output,
                "impact":   impact_output,
                "checks":   verification_output["checks"],
            }

        }

    def _is_vision_consistent(self, vision_output: dict) -> bool:
        objects  = vision_output.get("objects", [])
        actions  = vision_output.get("actions", [])
        env      = vision_output.get("environment", "")
        
        # Flag if objects and actions are contradictory
        driving_signals  = ["car", "steering wheel", "road", "driving", "vehicle", "highway"]
        planting_signals = ["tree", "sapling", "soil", "shovel", "gloves", "planting", "garden"]
        
        has_driving  = any(s in str(objects+actions+[env]).lower() for s in driving_signals)
        has_planting = any(s in str(objects+actions+[env]).lower() for s in planting_signals)
        
        # Mixed contradictory signals = hallucination
        if has_driving and has_planting:
            print("[Engine] WARNING: Contradictory vision signals detected, using YOLO fallback")
            return False
        return True
