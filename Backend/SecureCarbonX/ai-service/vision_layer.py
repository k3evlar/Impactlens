import os
import json
import base64
from groq import Groq
from ultralytics import YOLO

class VisionLayer:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key)
        self.vision_model = "meta-llama/llama-4-scout-17b-16e-instruct"
        
        # Load local YOLO model
        model_path = os.getenv("YOLO_MODEL", "yolov8n.pt")
        # Assuming the model is in the same directory or accessible
        self.yolo_model = YOLO(model_path)

    def analyze(self, image_path: str) -> dict:
        # 1. Local YOLO Detection
        yolo_objects = self._run_yolo(image_path)
        
        try:
            groq_analysis = self._groq_vision(image_path)
        except Exception as e:
            print(f"Groq Vision Error: {e}")
            print("[VisionLayer] Using YOLO-only fallback")
            groq_analysis = self._yolo_only_fallback(image_path)
            
        combined_objects = list(set(yolo_objects + groq_analysis.get("objects", [])))
        groq_analysis["objects"] = combined_objects
        
        return groq_analysis

    def _run_yolo(self, image_path: str) -> list:
        try:
            results = self.yolo_model(image_path, conf=0.25, verbose=False)
            objects = []
            for r in results:
                for box in r.boxes:
                    class_id = int(box.cls[0])
                    class_name = self.yolo_model.names[class_id]
                    objects.append(class_name)
            return objects
        except Exception as e:
            print(f"YOLO Error: {e}")
            return []

    def _groq_vision(self, image_path: str) -> dict:
        with open(image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()

        prompt = (
            "You are a precise image analysis AI. Study this image carefully.\n\n"
            "Return ONLY a valid JSON object with these exact fields:\n"
            "- objects: list ONLY objects you can clearly see "
            "(e.g. 'tree', 'shovel', 'gloves', 'soil', 'person'). "
            "Do NOT guess or infer objects that are not visible.\n"
            "- actions: list ONLY actions clearly visible in the image "
            "(e.g. 'planting', 'digging', 'cycling'). "
            "Do NOT invent actions.\n"
            "- environment: describe ONLY what you can clearly see "
            "(e.g. 'garden', 'park', 'street'). One short phrase only.\n"
            "- people_count: integer, count ONLY visible people\n"
            "- scale: one of exactly: individual, small_group, community, large_event\n\n"
            "STRICT RULES:\n"
            "1. Never describe things you are not certain about\n"
            "2. Never mix unrelated contexts\n"
            "3. If unsure about an object, leave it out\n"
            "4. Return ONLY valid JSON. No markdown, no backticks, no explanation."
        )

        response = self.client.chat.completions.create(
            model=self.vision_model,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }],
            max_tokens=512
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)

    def _yolo_only_fallback(self, image_path: str) -> dict:
        results = self.yolo_model(image_path)
        detected = []
        for r in results:
            for box in r.boxes:
                label = self.yolo_model.names[int(box.cls)]
                detected.append(label)
        
        # Remove duplicates
        detected = list(set(detected))
        
        # Infer basic actions from objects
        actions = []
        if any(o in detected for o in ["bicycle", "bike"]):
            actions.append("cycling")
        if any(o in detected for o in ["person"]):
            actions.append("outdoor activity")
        if any(o in detected for o in ["tree", "plant", "flower"]):
            actions.append("planting")
        if any(o in detected for o in ["trash", "garbage", "bag"]):
            actions.append("cleaning")
        
        # Count people
        people_count = detected.count("person")
        
        # Infer scale
        if people_count == 0 or people_count == 1:
            scale = "individual"
        elif people_count <= 5:
            scale = "small_group"
        elif people_count <= 20:
            scale = "community"
        else:
            scale = "large_event"
        
        return {
            "objects": detected,
            "actions": actions,
            "environment": "outdoor",
            "people_count": people_count,
            "scale": scale,
            "source": "yolo_fallback"
        }
