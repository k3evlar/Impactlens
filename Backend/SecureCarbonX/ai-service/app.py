from __future__ import annotations
from dotenv import load_dotenv
load_dotenv()

import os
import json
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from engine import ImpactLensEngine

app = FastAPI(title="ImpactLens AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine
api_key = os.getenv("GEMINI_API_KEY")
engine = ImpactLensEngine(api_key=api_key)

@app.post("/analyze-image")
async def verify_image(
    file: UploadFile = File(...),
    description: str = Form(None)
):
    """
    Core Vision-Reasoning endpoint for ImpactLens AI.
    Processes image and returns structured impact analysis.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image")

    try:
        image_data = await file.read()
        
        # Save to temp file since local models/gemini expect a generic file path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(image_data)
            tmp_path = tmp.name

        try:
            result = engine.analyze(tmp_path)
            
            # Simple Audit Log
            print(f"--- ImpactLens AI Analysis ---")
            print(f"Activity: {result.get('activity')}")
            print(f"Impact Score: {result.get('impact_score')}")
            print(f"Trust Score: {result.get('trust_score')}")
            
            return {
                "activity":          result["activity"],
                "impact_score":      result["impact_score"],
                "impact_level":      result["impact_level"],
                "trust_score":       result["trust_score"],
                "verification":      result["verification"],
                "narrative":         result["narrative"],
                "what_is_happening": result["what_is_happening"],
                "improvements":      result["improvements"],
                "breakdown":         result["breakdown"],
            }
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"ImpactLens Fault: {str(exc)}")

@app.get("/")
def health():
    return {"status": "ImpactLens AI Service Running", "engine": "Vision+Gemini+YOLO"}
