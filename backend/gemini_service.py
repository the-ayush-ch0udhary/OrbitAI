import httpx
import json
import re
import os
from typing import List, Dict, Any
from fastapi import HTTPException

# Candidate models ordered by priority
CANDIDATE_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
]

class GeminiService:
    def __init__(self, api_key: str):
        self.api_key = api_key.strip() if api_key else ""
        self.models = list(dict.fromkeys(CANDIDATE_MODELS))  # preserve order without duplicates
    
    async def analyze_career_paths(self, profile_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyze user profile and suggest top 5 career paths.
        """
        prompt = self._generate_analysis_prompt(profile_data)
        return await self._call_gemini(prompt)
    
    async def search_career_path(self, profile_data: Dict[str, Any], career_query: str) -> List[Dict[str, Any]]:
        """
        Search for a specific career path based on user query.
        """
        prompt = self._generate_search_prompt(profile_data, career_query)
        return await self._call_gemini(prompt)
    
    def _generate_analysis_prompt(self, profile: Dict[str, Any]) -> str:
        cv_text = profile.get('cv_text', 'Not provided')
        prompt = f"""
You are an expert AI Career Counselor. Analyze the following user profile carefully:
- Name: {profile.get('name', 'Not provided')}
- Current Degree / Education: {profile.get('degree', 'Not provided')}
- Qualifications & Achievements: {profile.get('qualifications', 'Not provided')}
- Skills: {profile.get('skills', 'Not provided')}
- CV/Resume Text: {cv_text}

Based on the user's profile, identify the top 5 most suitable and high-growth career paths.
For each career path, provide a clear reason for suitability, essential skills to acquire, and a detailed 4-6 step roadmap for achieving success.

IMPORTANT: Respond with ONLY a valid, raw JSON array (no conversational filler, no extra text outside the JSON). Follow this exact JSON schema:
[
  {{
    "career_path": "Career Title",
    "suitability_reason": "Detailed explanation of why this path matches their background and goals",
    "required_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "roadmap": [
      {{
        "step": 1,
        "action": "Milestone / Action Title",
        "details": "Detailed actionable steps, tools to learn, projects or certifications"
      }}
    ]
  }}
]
"""
        return prompt.strip()
    
    def _generate_search_prompt(self, profile: Dict[str, Any], career_query: str) -> str:
        cv_text = profile.get('cv_text', 'Not provided')
        prompt = f"""
You are an expert AI Career Counselor.
Analyze the following user profile:
- Name: {profile.get('name', 'Not provided')}
- Current Degree / Education: {profile.get('degree', 'Not provided')}
- Qualifications & Achievements: {profile.get('qualifications', 'Not provided')}
- Skills: {profile.get('skills', 'Not provided')}
- CV/Resume Text: {cv_text}

The user is specifically targeting the following career role: "{career_query}".
Analyze the alignment between their current profile and this role. Create a customized, highly actionable career roadmap tailored to their background.

IMPORTANT: Respond with ONLY a valid, raw JSON array containing a single career path object. Follow this exact JSON schema:
[
  {{
    "career_path": "{career_query}",
    "suitability_reason": "Detailed assessment of profile alignment, bridge strategy, and opportunities",
    "required_skills": ["Key Skill 1", "Key Skill 2", "Key Skill 3", "Key Skill 4", "Key Skill 5"],
    "roadmap": [
      {{
        "step": 1,
        "action": "Milestone / Action Title",
        "details": "Detailed actionable steps, projects to build, certifications, or networking actions"
      }}
    ]
  }}
]
"""
        return prompt.strip()
    
    def _extract_json_from_text(self, text: str) -> Any:
        """
        Safely extract and parse JSON from model output, stripping markdown blocks if present.
        """
        cleaned = text.strip()
        
        # Strip ```json ... ``` or ``` ... ```
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: search for first [ ... ] or { ... }
            match_arr = re.search(r'\[\s*\{.*\}\s*\]', cleaned, re.DOTALL)
            if match_arr:
                return json.loads(match_arr.group(0))
            
            match_obj = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if match_obj:
                parsed_obj = json.loads(match_obj.group(0))
                if isinstance(parsed_obj, dict):
                    if "career_paths" in parsed_obj and isinstance(parsed_obj["career_paths"], list):
                        return parsed_obj["career_paths"]
                    return [parsed_obj]
                return parsed_obj
            raise
    
    async def _call_gemini(self, prompt: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            raise HTTPException(status_code=400, detail="Gemini API key is required. Please set it in your Profile or .env.")
        
        last_error_message = "Unknown error"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            for model_name in self.models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    response = await client.post(
                        url,
                        json={
                            "contents": [{
                                "parts": [{"text": prompt}]
                            }],
                            "generationConfig": {
                                "temperature": 0.4,
                                "topK": 40,
                                "topP": 0.95,
                                "maxOutputTokens": 8192,
                            }
                        },
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'candidates' in result and len(result['candidates']) > 0:
                            candidate = result['candidates'][0]
                            parts = candidate.get('content', {}).get('parts', [])
                            if parts and 'text' in parts[0]:
                                raw_text = parts[0]['text']
                                career_paths = self._extract_json_from_text(raw_text)
                                if isinstance(career_paths, list):
                                    return career_paths
                                elif isinstance(career_paths, dict):
                                    return [career_paths]
                        continue
                    
                    # Handle errors for this model
                    error_detail = response.text
                    try:
                        err_json = response.json()
                        error_detail = err_json.get("error", {}).get("message", response.text)
                    except Exception:
                        pass
                    
                    last_error_message = error_detail
                    
                    # If model is not found/deprecated, try the next fallback model in the list
                    if response.status_code == 404 or "no longer available" in error_detail.lower() or "not found" in error_detail.lower():
                        continue
                    
                    # If invalid key or quota exceeded, stop trying and return specific status
                    if response.status_code in [400, 401, 403] and "API_KEY_INVALID" in error_detail:
                        raise HTTPException(status_code=401, detail=f"Invalid Gemini API Key: {error_detail}")
                    elif response.status_code == 429:
                        raise HTTPException(status_code=429, detail="Gemini API quota exceeded. Please wait a moment or check your quotas.")
                        
                except HTTPException:
                    raise
                except Exception as e:
                    last_error_message = str(e)
                    continue

        raise HTTPException(
            status_code=500,
            detail=f"Gemini API error (tried models {', '.join(self.models)}): {last_error_message}"
        )