import os
from groq import Groq

class NarrativeLayer:
    def __init__(self):
        GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY missing in environment")
        self.groq_client = Groq(api_key=GROQ_API_KEY)
        self.narrative_model = "llama-3.3-70b-versatile"

    def generate_narrative(self, activity: str, impact: dict, vision: dict) -> str:
        try:
            prompt = (
                f"Activity: {activity}\n"
                f"Impact score: {impact['impact_score']}/100\n"
                f"Objects detected: {vision.get('objects', [])}\n"
                f"Environment: {vision.get('environment', 'unknown')}\n\n"
                "Write 2-3 sentences explaining WHY this activity has this "
                "impact score. Be specific about environmental and social "
                "benefits. Professional, factual, encouraging tone."
            )
            response = self.groq_client.chat.completions.create(
                model=self.narrative_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            if "401" in str(e) or "Authentication" in str(e):
                print("[NarrativeLayer] CRITICAL GROQ AUTH ERROR - RAISING")
                raise e
            print(f"Narrative Error: {e}")
            return (
                f"This {activity.replace('_', ' ')} activity contributes "
                f"positively to environmental sustainability with an impact "
                f"score of {impact['impact_score']}/100."
            )

    def generate_what_is_happening(self, vision: dict, activity: str) -> str:
        try:
            prompt = (
                f"Objects clearly visible in image: {vision.get('objects', [])}\n"
                f"Actions clearly visible: {vision.get('actions', [])}\n"
                f"Environment: {vision.get('environment', 'unknown')}\n"
                f"Number of people: {vision.get('people_count', 0)}\n"
                f"Activity classified as: {activity}\n\n"
                "Describe ONLY what is clearly happening based on the data above.\n"
                "Do NOT invent details not supported by the objects and actions listed.\n"
                "Do NOT mix unrelated contexts.\n"
                "Write 2 clear, confident sentences. "
                "If data is limited, say what you can see and nothing more."
            )
            response = self.groq_client.chat.completions.create(
                model=self.narrative_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            if "401" in str(e) or "Authentication" in str(e):
                print("[NarrativeLayer] CRITICAL GROQ AUTH ERROR - RAISING")
                raise e
            print(f"What Is Happening Error: {e}")
            return (
                f"The image shows a person engaged in {activity.replace('_', ' ')} "
                f"in a {vision.get('environment', 'outdoor')} setting."
            )

    def generate_improvements(self, activity: str, impact: dict, vision: dict) -> list:
        try:
            prompt = (
                f"Activity: {activity.replace('_', ' ')}\n"
                f"Impact score: {impact['impact_score']}/100\n"
                f"Scale: {vision.get('scale', 'individual')}\n\n"
                "Suggest exactly 3 specific improvements directly related to "
                f"the activity of {activity.replace('_', ' ')}.\n"
                "Each suggestion must:\n"
                "1. Be directly relevant to this specific activity\n"
                "2. Be under 12 words\n"
                "3. Actually increase environmental or social impact\n\n"
                "Return ONLY a JSON array of 3 strings. No backticks, no explanation.\n"
                "Example for tree_planting: "
                "[\"Plant native species for greater local biodiversity\", "
                "\"Involve neighbors to increase community scale\", "
                "\"Document GPS location for carbon credit verification\"]"
            )
            response = self.groq_client.chat.completions.create(
                model=self.narrative_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            raw = response.choices[0].message.content.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            import json
            return json.loads(raw)
        except Exception as e:
            if "401" in str(e) or "Authentication" in str(e):
                print("[NarrativeLayer] CRITICAL GROQ AUTH ERROR - RAISING")
                raise e
            print(f"Improvements Error: {e}")
            return [
                "Involve more community members to increase scale impact",
                "Document activity with GPS coordinates for verification",
                "Repeat activity regularly to compound environmental benefits"
            ]
