from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from urllib.parse import urlparse
import os
from dotenv import load_dotenv
import uuid
from typing import Optional

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/orbit_ai")

# Global database client
client = None
db = None

def get_database():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        # Extract database name from URL if present
        try:
            parsed = urlparse(MONGO_URL)
            db_name = parsed.path.strip('/')
            if '?' in db_name:
                db_name = db_name.split('?')[0]
        except Exception:
            db_name = ""
        
        if not db_name:
            db_name = "orbit_ai"
            
        db = client[db_name]
    return db

def get_db():
    """Dependency for routes that need database access"""
    return get_database()

async def init_db():
    """Initialize database with indexes and verify connectivity"""
    try:
        database = get_database()
        # Ping the server to check connectivity
        await database.command("ping")
        # Create indexes for better performance
        await database.users.create_index("email", unique=True)
        await database.users.create_index("user_id", unique=True)
        await database.profiles.create_index("user_id", unique=True)
        await database.career_analyses.create_index("user_id")
        await database.career_analyses.create_index("created_at")
        print("[INFO] MongoDB connection verified and indexes created successfully.")
    except Exception as e:
        print(f"[WARNING] MongoDB connection check during startup: {e}")
        print(f"[INFO] If connecting to MongoDB Atlas, ensure password in backend/.env is set.")

# Helper functions for User operations
class UserDB:
    @staticmethod
    async def create_user(email: str, password_hash: str, name: Optional[str] = None):
        db = get_database()
        user_id = str(uuid.uuid4())
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
        return user_doc
    
    @staticmethod
    async def find_by_email(email: str):
        db = get_database()
        return await db.users.find_one({"email": email})
    
    @staticmethod
    async def find_by_id(user_id: str):
        db = get_database()
        return await db.users.find_one({"user_id": user_id})

# Helper functions for Profile operations
class ProfileDB:
    @staticmethod
    async def create_profile(user_id: str, name: Optional[str] = None):
        db = get_database()
        profile_doc = {
            "profile_id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": name,
            "degree": None,
            "qualifications": None,
            "skills": None,
            "gemini_api_key": None,
            "profile_picture_base64": None,
            "cv_pdf_base64": None,
            "cv_text": None,
            "updated_at": datetime.now(timezone.utc)
        }
        await db.profiles.insert_one(profile_doc)
        return profile_doc
    
    @staticmethod
    async def find_by_user_id(user_id: str):
        db = get_database()
        return await db.profiles.find_one({"user_id": user_id})
    
    @staticmethod
    async def update_profile(user_id: str, update_data: dict):
        db = get_database()
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = await db.profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None

# Helper functions for CareerAnalysis operations
class CareerAnalysisDB:
    @staticmethod
    async def create_analysis(user_id: str, analysis_result_json: str):
        db = get_database()
        analysis_doc = {
            "analysis_id": str(uuid.uuid4()),
            "user_id": user_id,
            "analysis_result_json": analysis_result_json,
            "created_at": datetime.now(timezone.utc)
        }
        await db.career_analyses.insert_one(analysis_doc)
        return analysis_doc
    
    @staticmethod
    async def find_by_user_id(user_id: str):
        db = get_database()
        cursor = db.career_analyses.find({"user_id": user_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    @staticmethod
    async def delete_analysis(user_id: str, analysis_id: str):
        db = get_database()
        result = await db.career_analyses.delete_one({"user_id": user_id, "analysis_id": analysis_id})
        return result.deleted_count > 0