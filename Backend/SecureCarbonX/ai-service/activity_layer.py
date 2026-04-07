ACTIVITY_RULES = {
    "tree_planting":    {"objects": ["sapling", "tree", "seedling", "plant", "potted plant", "shovel", "soil", "dirt", "bucket", "spade"], "actions": ["planting", "digging", "holding", "standing"]},
    "waste_collection": {"objects": ["trash", "garbage", "litter", "bag", "bin", "waste", "gloves", "wrapper"], "actions": ["collecting", "cleaning", "picking", "holding"]},
    "beach_cleanup":    {"objects": ["trash", "litter", "plastic", "garbage", "sand", "shell"], "environment_keywords": ["beach", "coastal", "shore", "sand", "ocean", "sea"]},
    "solar_install":    {"objects": ["solar", "panel", "roof", "tool"], "actions": ["installing", "mounting", "fixing", "standing"]},
    "composting":       {"objects": ["compost", "organic", "bin", "food waste", "soil", "dirt"], "actions": ["composting", "sorting", "dumping", "mixing"]},
    "community_garden": {"objects": ["vegetable", "garden", "seeds", "plant", "soil", "shovel", "water"], "environment_keywords": ["garden", "community", "farm", "field"]},
    "river_cleanup":    {"objects": ["trash", "bag", "net", "litter", "plastic"], "environment_keywords": ["river", "stream", "lake", "water", "bank"]},
    "recycling":        {"objects": ["recyclable", "bottle", "can", "paper", "cardboard", "plastic", "bin"], "actions": ["sorting", "recycling", "holding", "dropping"]},
    "cycling": {
        "objects": ["bicycle", "bike", "cycle", "helmet", "wheel"],
        "actions": ["cycling", "riding", "biking", "pedaling"]
    },
    "walking": {
        "objects": ["pedestrian", "footpath", "shoes", "path", "trail", "sidewalk"],
        "actions": ["walking", "hiking", "trekking", "strolling"]
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
        confidence = min((scores[best] / max_possible) + 0.3, 0.99) # Add +0.3 floor boost for correctly classified activities to prevent drastic score drops vs YOLO

        return {
            "activity": best,
            "confidence": round(confidence, 2),
            "all_candidates": scores
        }
