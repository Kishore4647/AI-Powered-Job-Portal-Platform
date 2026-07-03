"""
Thin wrapper around the Gemini API for job-portal-specific AI features.
API key is loaded from settings (which pulls from .env) - never hardcoded.
"""
import json
import logging
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiServiceError(Exception):
    pass


def _get_model():
    if not settings.GEMINI_API_KEY:
        raise GeminiServiceError("GEMINI_API_KEY is not configured on the server.")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(settings.GEMINI_MODEL)


def _generate_json(prompt: str) -> dict:
    model = _get_model()
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json", "temperature": 0.4},
        )
        text = response.text
        return json.loads(text)
    except Exception as exc:
        logger.exception("Gemini API call failed")
        raise GeminiServiceError(f"AI service failed: {exc}") from exc


def summarize_resume(resume_text: str) -> dict:
    """Overall resume summary, strengths, weaknesses, suggestions (no job context)."""
    prompt = f"""
You are an expert technical recruiter and resume coach. Analyze the resume text below and
respond ONLY with a JSON object (no markdown, no commentary) with this exact schema:

{{
  "summary": "2-4 sentence professional summary of the candidate",
  "strengths": ["short bullet point", "..."],
  "weaknesses": ["short bullet point", "..."],
  "suggestions": ["actionable improvement suggestion", "..."],
  "estimated_experience_level": "Fresher | Junior | Mid | Senior",
  "key_skills_detected": ["skill1", "skill2"]
}}

Resume text:
\"\"\"{resume_text[:12000]}\"\"\"
"""
    return _generate_json(prompt)


def match_resume_to_job(resume_text: str, job_title: str, job_description: str, job_requirements: str) -> dict:
    """Compares candidate resume against a specific job posting."""
    prompt = f"""
You are an expert technical recruiter. Compare the candidate resume to the job posting below.
Respond ONLY with a JSON object (no markdown, no commentary) with this exact schema:

{{
  "match_score": 0-100 integer,
  "summary": "2-3 sentence overall fit assessment",
  "strengths": ["why the candidate fits, short bullets"],
  "weaknesses": ["gaps relative to this specific job, short bullets"],
  "missing_skills": ["skill mentioned in job but not evident in resume"],
  "suggestions": ["specific actionable suggestions to improve fit for THIS job"]
}}

Job Title: {job_title}
Job Description:
\"\"\"{job_description[:6000]}\"\"\"
Job Requirements:
\"\"\"{job_requirements[:3000]}\"\"\"

Candidate Resume:
\"\"\"{resume_text[:12000]}\"\"\"
"""
    return _generate_json(prompt)


def generate_cover_letter(resume_text: str, job_title: str, company_name: str, job_description: str) -> dict:
    """Generates a tailored cover letter draft."""
    prompt = f"""
You are an expert career coach. Write a concise, professional, tailored cover letter (250-350 words)
for the candidate applying to the role below, based on their resume. Respond ONLY with a JSON object
(no markdown, no commentary) with this exact schema:

{{
  "cover_letter": "the full cover letter text, plain text with paragraph breaks as \\n\\n"
}}

Job Title: {job_title}
Company: {company_name}
Job Description:
\"\"\"{job_description[:6000]}\"\"\"

Candidate Resume:
\"\"\"{resume_text[:12000]}\"\"\"
"""
    return _generate_json(prompt)
