from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import timedelta
import json
import os
import uvicorn

from database import init_db, UserDB, ProfileDB, CareerAnalysisDB
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from pdf_parser import parse_pdf_from_base64
from gemini_service import GeminiService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    print("MongoDB connection initialized successfully for Orbit AI.")
    yield
    # Shutdown
    print("Shutting down Orbit AI server.")

app = FastAPI(title="Orbit AI - Career Guidance Platform API", lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class RegisterRequest(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    name: Optional[str] = None

class ProfileResponse(BaseModel):
    name: Optional[str] = None
    degree: Optional[str] = None
    qualifications: Optional[str] = None
    skills: Optional[str] = None
    gemini_api_key: Optional[str] = None
    profile_picture_base64: Optional[str] = None
    cv_pdf_base64: Optional[str] = None
    cv_text: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    degree: Optional[str] = None
    qualifications: Optional[str] = None
    skills: Optional[str] = None
    gemini_api_key: Optional[str] = None
    profile_picture_base64: Optional[str] = None
    cv_pdf_base64: Optional[str] = None

class CareerSearchRequest(BaseModel):
    career_query: str

# Endpoints

@app.get("/")
@app.get("/api")
async def root():
    return {
        "service": "Orbit AI - Career Guidance Platform API",
        "status": "healthy",
        "documentation": "/docs",
        "health_check": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Orbit AI API",
        "database": "mongodb"
    }

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    # Check if email already registered
    existing_user = await UserDB.find_by_email(request.email.lower().strip())
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Clean user name
    clean_name = request.name.strip() if request.name and request.name.strip() else None

    # Create new user
    hashed_password = get_password_hash(request.password)
    new_user = await UserDB.create_user(request.email.lower().strip(), hashed_password, name=clean_name)
    
    # Initialize profile with user's name
    await ProfileDB.create_profile(new_user["user_id"], name=clean_name)
    
    # Generate JWT access token
    access_token = create_access_token(
        data={"sub": new_user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        email=new_user["email"],
        name=clean_name
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = await UserDB.find_by_email(request.email.lower().strip())
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )
    
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        email=user["email"],
        name=user.get("name")
    )

@app.get("/api/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        profile = await ProfileDB.create_profile(current_user["user_id"], name=current_user.get("name"))
    
    gemini_key = profile.get("gemini_api_key") or os.getenv("GEMINI_API_KEY", "")
    
    return ProfileResponse(
        name=profile.get("name") or current_user.get("name"),
        degree=profile.get("degree"),
        qualifications=profile.get("qualifications"),
        skills=profile.get("skills"),
        gemini_api_key=gemini_key if gemini_key else None,
        profile_picture_base64=profile.get("profile_picture_base64"),
        cv_pdf_base64=profile.get("cv_pdf_base64"),
        cv_text=profile.get("cv_text")
    )

@app.put("/api/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    update_data: Dict[str, Any] = {}
    
    if request.name is not None:
        update_data["name"] = request.name
    if request.degree is not None:
        update_data["degree"] = request.degree
    if request.qualifications is not None:
        update_data["qualifications"] = request.qualifications
    if request.skills is not None:
        update_data["skills"] = request.skills
    if request.gemini_api_key is not None:
        update_data["gemini_api_key"] = request.gemini_api_key.strip()
    if request.profile_picture_base64 is not None:
        update_data["profile_picture_base64"] = request.profile_picture_base64
    
    # Handle PDF CV upload and text parsing
    if request.cv_pdf_base64 is not None:
        update_data["cv_pdf_base64"] = request.cv_pdf_base64
        if request.cv_pdf_base64:
            try:
                cv_text = parse_pdf_from_base64(request.cv_pdf_base64)
                update_data["cv_text"] = cv_text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to process CV PDF: {str(e)}")
    
    await ProfileDB.update_profile(current_user["user_id"], update_data)
    
    return {"message": "Profile updated successfully"}

@app.post("/api/analyze-career")
async def analyze_career(current_user: dict = Depends(get_current_user)):
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete your profile first.")
    
    gemini_key = profile.get("gemini_api_key") or os.getenv("GEMINI_API_KEY")
    if not gemini_key or not gemini_key.strip():
        raise HTTPException(
            status_code=400,
            detail="Gemini API key not found. Please add your Gemini API key in the Profile section or configure GEMINI_API_KEY in backend/.env."
        )
    
    # Validate required profile fields
    missing_fields = []
    if not profile.get("name"): missing_fields.append("Full Name")
    if not profile.get("degree"): missing_fields.append("Degree/Field of study")
    if not profile.get("qualifications"): missing_fields.append("Qualifications")
    if not profile.get("skills"): missing_fields.append("Skills")
    if not profile.get("cv_text") and not profile.get("cv_pdf_base64"): missing_fields.append("CV/Resume PDF")
    
    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Incomplete profile. Please provide: {', '.join(missing_fields)}."
        )
    
    profile_data = {
        "name": profile.get("name"),
        "degree": profile.get("degree"),
        "qualifications": profile.get("qualifications"),
        "skills": profile.get("skills"),
        "cv_text": profile.get("cv_text") or "Not provided"
    }
    
    gemini_service = GeminiService(gemini_key.strip())
    try:
        career_paths = await gemini_service.analyze_career_paths(profile_data)
        
        # Save analysis to database
        saved_doc = await CareerAnalysisDB.create_analysis(
            current_user["user_id"],
            json.dumps(career_paths)
        )
        
        return {
            "career_paths": career_paths,
            "analysis_id": saved_doc["analysis_id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Career analysis failed: {str(e)}")

@app.post("/api/search-career")
async def search_career(
    request: CareerSearchRequest,
    current_user: dict = Depends(get_current_user)
):
    if not request.career_query or not request.career_query.strip():
        raise HTTPException(status_code=400, detail="Career search query cannot be empty.")
        
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete your profile first.")
    
    gemini_key = profile.get("gemini_api_key") or os.getenv("GEMINI_API_KEY")
    if not gemini_key or not gemini_key.strip():
        raise HTTPException(
            status_code=400,
            detail="Gemini API key not found. Please add your Gemini API key in the Profile section or configure GEMINI_API_KEY in backend/.env."
        )
    
    profile_data = {
        "name": profile.get("name") or current_user.get("name") or "Learner",
        "degree": profile.get("degree") or "Not specified",
        "qualifications": profile.get("qualifications") or "Not specified",
        "skills": profile.get("skills") or "Not specified",
        "cv_text": profile.get("cv_text") or "Not provided"
    }
    
    gemini_service = GeminiService(gemini_key.strip())
    try:
        career_paths = await gemini_service.search_career_path(profile_data, request.career_query.strip())
        return {"career_paths": career_paths}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Career search failed: {str(e)}")

@app.get("/api/analyses")
async def get_analyses(current_user: dict = Depends(get_current_user)):
    analyses = await CareerAnalysisDB.find_by_user_id(current_user["user_id"])
    formatted_analyses = []
    
    for item in analyses:
        try:
            result_data = json.loads(item.get("analysis_result_json", "[]"))
        except Exception:
            result_data = []
            
        created_at_val = item.get("created_at")
        formatted_analyses.append({
            "id": item.get("analysis_id"),
            "created_at": created_at_val.isoformat() if hasattr(created_at_val, "isoformat") else str(created_at_val),
            "result": result_data
        })
        
    return {"analyses": formatted_analyses}

@app.delete("/api/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    success = await CareerAnalysisDB.delete_analysis(current_user["user_id"], analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    return {"message": "Analysis deleted successfully"}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
