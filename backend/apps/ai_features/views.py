from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsCandidate
from apps.jobs.models import Job
from .gemini_service import summarize_resume, match_resume_to_job, generate_cover_letter, GeminiServiceError
from .serializers import JobMatchRequestSerializer, CoverLetterRequestSerializer
from .throttles import AIFeatureRateThrottle
from .models import AIInteractionLog


def _get_resume_text(user):
    profile = getattr(user, "candidate_profile", None)
    if not profile or not profile.resume_text:
        raise ValidationError(
            "No resume text found. Please upload a resume to your profile first."
        )
    return profile, profile.resume_text


class ResumeSummaryView(APIView):
    """
    AI Feature: analyze the candidate's own resume - summary, strengths,
    weaknesses, suggestions. Used from the 'Check my profile' button.
    """
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    throttle_classes = [AIFeatureRateThrottle]

    def post(self, request):
        profile, resume_text = _get_resume_text(request.user)
        try:
            result = summarize_resume(resume_text)
        except GeminiServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        AIInteractionLog.objects.create(
            user=request.user, feature_type=AIInteractionLog.FeatureType.RESUME_SUMMARY, response_json=result
        )
        return Response(result)


class JobMatchView(APIView):
    """
    AI Feature: compare the candidate's resume against a specific job posting
    they are viewing. Used from the 'Check against this job' button.
    """
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    throttle_classes = [AIFeatureRateThrottle]

    def post(self, request):
        serializer = JobMatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = get_object_or_404(Job, id=serializer.validated_data["job_id"])

        profile, resume_text = _get_resume_text(request.user)
        try:
            result = match_resume_to_job(
                resume_text=resume_text,
                job_title=job.title,
                job_description=job.description,
                job_requirements=job.requirements,
            )
        except GeminiServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        AIInteractionLog.objects.create(
            user=request.user, job=job, feature_type=AIInteractionLog.FeatureType.JOB_MATCH, response_json=result
        )
        return Response(result)


class CoverLetterView(APIView):
    """AI Feature (optional): generate a tailored cover letter draft for a job."""
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    throttle_classes = [AIFeatureRateThrottle]

    def post(self, request):
        serializer = CoverLetterRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = get_object_or_404(Job, id=serializer.validated_data["job_id"])

        profile, resume_text = _get_resume_text(request.user)
        try:
            result = generate_cover_letter(
                resume_text=resume_text,
                job_title=job.title,
                company_name=job.company.company_name,
                job_description=job.description,
            )
        except GeminiServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        AIInteractionLog.objects.create(
            user=request.user, job=job, feature_type=AIInteractionLog.FeatureType.COVER_LETTER, response_json=result
        )
        return Response(result)
