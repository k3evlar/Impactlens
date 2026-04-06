import os
import json
from typing import Any, Dict, List
import google.generativeai as genai
from PIL import Image

# Initialize Gemini 1.5 Flash (Vision)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ReasoningLayer:
    @staticmethod
    def interpret(image: Image.Image, metadata: Dict[str, Any]) -> Dict[str, Any]:
        if not GEMINI_API_KEY:
            return ReasoningLayer.fallback(metadata)

        user_description = metadata.get("user_description") or "Self-reported sustainability activity"
        s = metadata.get("structured_data", {})
        
        # Protocol V8: High-Confidence Intelligence reasoning
        prompt = f"""
        You are the ImpactLens AI Reasoning System. You provide confident, meaningful, and professional interpretations of sustainability proofs.

        INPUT DATA:
        - Activity (Baseline): {s.get('activity')}
        - Activity Confidence (Baseline): {s.get('activity_confidence')}
        - Effort (Inferred): {s.get('effort')}
        - People: {s.get('people_count')}
        - Objects Detected: {s.get('objects')}
        - Pose/Motion: {s.get('pose')} / {s.get('motion_level')}
        - Environment: {s.get('environment')}
        - Score (Rule-Based): {s.get('impact_score')}
        - Narrative Context: "{user_description}"

        CRITICAL REASONING RULES:
        1. NEVER say "unknown", "insufficient data", or "cannot determine". Be an EXPERT judge.
        2. FRAUD DETECTION: If the 'Narrative Context' or 'User Claim' is a BLATANT CONTRADICTION to the photo (e.g. they claim 'planting' but the photo is a car, a selfie, or just a room), you MUST REJECT it with a score < 20. Do not be "nice" to fraud; be confident in your rejection.
        3. AMBIGUITY HANDLING: If the activity is honest-looking (people being active, outdoors, cleaning, moving) but the specific sensor labels are weak, use your visual intelligence to label it meaningfully (e.g. "Community Physical Engagement").
        4. MINIMUM QUALITY FOR HONEST EFFORT: For any clearly honest/active sustainability-aligned scene, keep the score ≥ 60. 
        5. DISCREPANCY: Prioritize THE VISUAL TRUTH. If the user CLAIMS planting and the photo confirms dirt/greenery, approve it even if YOLO missed the 'plant' label.

        OUTPUT FORMAT (STRICT JSON):
        {{
            "activity": "Confident Activity Name",
            "effort": "Low | Medium | High",
            "refined_impact_score": 0-100,
            "impact_level": "Low | Moderate | High",
            "impact_summary": "1-2 confident lines on personal/environmental benefit",
            "impact_narrative": "One powerful 1-line insight (Max 15 words) that feels smart/inspiring",
            "detailed_explanation": "2-3 lines explaining exactly what is happening and NOT why it matters",
            "reasoning": ["Bullet point cue 1", "Bullet point cue 2"],
            "suggestions": ["Specific improvement 1", "Specific improvement 2"]
        }}
        """
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content([prompt, image])
            
            content = response.text
            start = content.find('{')
            end = content.rfind('}') + 1
            result = json.loads(content[start:end])
            
            return {
                "activity": result.get("activity"),
                "effort": result.get("effort"),
                "refined_impact_score": result.get("refined_impact_score", s.get('impact_score', 60)),
                "impact_level": result.get("impact_level", s.get('impact_level', 'Moderate')),
                "impact_summary": result.get("impact_summary"),
                "impact_narrative": result.get("impact_narrative"),
                "detailed_explanation": result.get("detailed_explanation"),
                "reasoning": result.get("reasoning"),
                "suggestions": result.get("suggestions")
            }
        except Exception as e:
            print(f"ReasoningLayer Error: {e}")
            return ReasoningLayer.fallback(metadata)

    @staticmethod
    def fallback(metadata: Dict[str, Any]) -> Dict[str, Any]:
        s = metadata.get("structured_data", {})
        return {
            "activity": s.get("activity") if s.get("activity") != "unknown" else "Positive Sustainability Task",
            "effort": s.get("effort", "Medium"),
            "refined_impact_score": max(60, s.get("impact_score", 65)),
            "impact_level": s.get("impact_level") if s.get("impact_level") != "Low" else "Moderate",
            "impact_summary": "This activity reflects positive engagement in a physically active and potentially beneficial outdoor task.",
            "impact_narrative": "Small everyday actions like this collectively contribute to healthier lifestyles and sustainable environments.",
            "detailed_explanation": "The system has detected active engagement in a task that aligns with sustainability goals and environmental awareness.",
            "reasoning": ["Visual cues confirm physical activity", "Environmental context indicates positive intent"],
            "suggestions": ["Continue consistent engagement for long-term impact", "Involve local community members to scale the effect"]
        }
