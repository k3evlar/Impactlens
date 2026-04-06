ACTIVITY_BASE_VALUES = {
    "tree_planting":    {"env": 85, "social": 60, "effort": 70},
    "waste_collection": {"env": 65, "social": 50, "effort": 55},
    "beach_cleanup":    {"env": 75, "social": 55, "effort": 60},
    "solar_install":    {"env": 90, "social": 40, "effort": 80},
    "composting":       {"env": 60, "social": 35, "effort": 45},
    "community_garden": {"env": 55, "social": 80, "effort": 50},
    "river_cleanup":    {"env": 80, "social": 60, "effort": 65},
    "recycling":        {"env": 50, "social": 30, "effort": 35},
    "cycling":          {"env": 55, "social": 40, "effort": 50},
    "walking":          {"env": 30, "social": 25, "effort": 20},
    "carpooling":       {"env": 45, "social": 50, "effort": 30},
    "public_transport": {"env": 50, "social": 45, "effort": 25},
    "general_activity": {"env": 30, "social": 25, "effort": 30},  # fallback — low on purpose
}

SCALE_MULTIPLIERS = {
    "individual":   1.0,
    "small_group":  1.3,
    "community":    1.6,
    "large_event":  2.0,
}

WEIGHTS = {"env": 0.5, "social": 0.3, "effort": 0.2}

class ImpactLayer:
    def score(self, activity_output: dict, vision_output: dict) -> dict:
        activity   = activity_output.get("activity", "general_activity")
        confidence = activity_output.get("confidence", 0.5)
        scale      = vision_output.get("scale", "individual")

        base = ACTIVITY_BASE_VALUES.get(activity, ACTIVITY_BASE_VALUES["general_activity"])
        multiplier = SCALE_MULTIPLIERS.get(scale, 1.0)

        raw_score = (
            base["env"]    * WEIGHTS["env"]    +
            base["social"] * WEIGHTS["social"] +
            base["effort"] * WEIGHTS["effort"]
        )

        # Scale boost + confidence dampening (low confidence → closer to fallback)
        adjusted = raw_score * multiplier * confidence
        final_score = round(min(adjusted, 100))

        if final_score >= 75:   level = "High"
        elif final_score >= 50: level = "Moderate"
        elif final_score >= 25: level = "Low"
        else:                   level = "Minimal"

        return {
            "impact_score": final_score,
            "impact_level": level,
            "breakdown": {
                "environmental": round(base["env"] * WEIGHTS["env"], 1),
                "social":        round(base["social"] * WEIGHTS["social"], 1),
                "effort":        round(base["effort"] * WEIGHTS["effort"], 1),
            },
            "scale_multiplier": multiplier,
            "confidence_factor": confidence,
        }
