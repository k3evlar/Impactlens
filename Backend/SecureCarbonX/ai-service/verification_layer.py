import hashlib

# In-memory store for demo. In prod, use Redis or a DB.
_seen_hashes = set()

class VerificationLayer:
    def verify(self, image_path: str, vision_output: dict) -> dict:
        checks = {}

        # 1. Image Hash Generation
        with open(image_path, "rb") as f:
            img_hash = hashlib.md5(f.read()).hexdigest()
            
        checks["is_duplicate"] = False # Handled by core ledger logic

        # 2. Sanity check: does vision output look realistic?
        objects = vision_output.get("objects", [])
        actions = vision_output.get("actions", [])
        checks["has_objects"]  = len(objects) > 0
        checks["has_actions"]  = len(actions) > 0
        checks["people_present"] = vision_output.get("people_count", 0) > 0

        # 3. AI-generated image detector (heuristic)
        # Stub for MVP. Could plug in external API here.
        checks["ai_generated_flag"] = False

        # Trust score calculation
        penalties = 0
        if checks["is_duplicate"]:      penalties += 40
        if not checks["has_objects"]:   penalties += 20
        if not checks["has_actions"]:   penalties += 15
        if not checks["people_present"]: penalties += 10
        if checks["ai_generated_flag"]: penalties += 30

        trust_score = max(0, 100 - penalties)

        return {
            "trust_score": trust_score,
            "verification": "Accepted" if trust_score >= 50 else "Rejected",
            "checks": checks,
            "image_hash": img_hash,
        }
