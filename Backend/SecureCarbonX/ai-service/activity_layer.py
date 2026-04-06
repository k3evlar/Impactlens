ACTIVITY_RULES = {
    "tree_planting":    {"objects": ["sapling", "tree", "seedling", "plant", "potted plant"], "actions": ["planting", "digging"]},
    "waste_collection": {"objects": ["trash bag", "garbage bag", "litter", "garbage"], "actions": ["collecting", "cleaning", "picking"]},
    "beach_cleanup":    {"objects": ["trash bag", "litter", "plastic", "garbage"], "environment_keywords": ["beach", "coastal", "shore", "sand"]},
    "solar_install":    {"objects": ["solar panel", "panel"], "actions": ["installing", "mounting"]},
    "composting":       {"objects": ["compost", "organic waste", "bin"], "actions": ["composting", "sorting"]},
    "community_garden": {"objects": ["vegetable", "garden bed", "seeds", "plant"], "environment_keywords": ["garden", "community"]},
    "river_cleanup":    {"objects": ["trash bag", "net", "litter"], "environment_keywords": ["river", "stream", "lake", "water"]},
    "recycling":        {"objects": ["recyclable", "bottle", "can", "paper"], "actions": ["sorting", "recycling"]},
    "cycling": {
        "objects": ["bicycle", "bike", "cycle", "helmet"],
        "actions": ["cycling", "riding", "biking"]
    },
    "walking": {
        "objects": ["pedestrian", "footpath", "shoes"],
        "actions": ["walking", "hiking", "trekking"]
    },
    "carpooling": {
        "objects": ["car", "vehicle", "passengers"],
        "actions": ["carpooling", "sharing", "commuting"]
    },
    "public_transport": {
        "objects": ["bus", "train", "metro", "tram"],
        "actions": ["commuting", "travelling", "riding"]
    }
}

class ActivityLayer:
    def infer(self, vision_output: dict) -> dict:
        objects    = [o.lower() for o in vision_output.get("objects", [])]
        actions    = [a.lower() for a in vision_output.get("actions", [])]
        environment = vision_output.get("environment", "").lower()

        scores = {}
        for activity, criteria in ACTIVITY_RULES.items():
            score = 0
            # Check for object matches
            obj_matches = sum(1 for kw in criteria.get("objects", []) if any(kw in o for o in objects))
            # Check for action matches
            act_matches = sum(1 for kw in criteria.get("actions", []) if any(kw in a for a in actions))
            # Check for environment matches
            env_matches = sum(1 for kw in criteria.get("environment_keywords", []) if kw in environment)
            
            # Weighted scoring
            score = (obj_matches * 3) + (act_matches * 2) + (env_matches * 1)
            if score > 0:
                scores[activity] = score

        if not scores:
            return {"activity": "general_activity", "confidence": 0.3, "matched_signals": []}

        best = max(scores, key=scores.get)
        max_possible = 6  # rough ceiling per activity
        confidence = min(scores[best] / max_possible, 0.99)

        return {
            "activity": best,
            "confidence": round(confidence, 2),
            "all_candidates": scores
        }
