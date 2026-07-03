from django.shortcuts import get_object_or_404
from django.http import FileResponse
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from apps.users.permissions import IsCandidate, IsRecruiter
from apps.candidates.models import CandidateProfile
from apps.jobs.models import Job
from .models import Application
from .serializers import (
    ApplicationCreateSerializer, ApplicationCandidateSerializer,
    ApplicationRecruiterSerializer, ApplicationStatusUpdateSerializer,
)


class ApplyToJobView(generics.CreateAPIView):
    """
    One-click apply. Candidate must have a resume already uploaded to their
    profile; that resume is snapshotted onto the application at apply-time.
    """
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    serializer_class = ApplicationCreateSerializer

    def create(self, request, *args, **kwargs):
        try:
            profile = request.user.candidate_profile
        except CandidateProfile.DoesNotExist:
            profile = None

        if not profile or not profile.resume:
            raise ValidationError("Please upload a resume to your profile before applying.")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.validated_data["job"]

        if Application.objects.filter(job=job, candidate=request.user).exists():
            raise ValidationError("You have already applied to this job.")

        application = Application.objects.create(
            job=job,
            candidate=request.user,
            resume_snapshot=profile.resume,
            cover_letter=serializer.validated_data.get("cover_letter", ""),
        )
        return Response(ApplicationCandidateSerializer(application).data, status=status.HTTP_201_CREATED)


class MyApplicationsView(generics.ListAPIView):
    """Candidate: view all of their applications + status."""
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    serializer_class = ApplicationCandidateSerializer
    filterset_fields = ["status"]

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user).select_related("job", "job__company")


class JobApplicantsView(generics.ListAPIView):
    """Recruiter: view all applicants for one of their jobs."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    serializer_class = ApplicationRecruiterSerializer
    filterset_fields = ["status"]

    def get_queryset(self):
        job = get_object_or_404(Job, id=self.kwargs["job_id"])
        if job.recruiter_id != self.request.user.id:
            raise PermissionDenied("You do not own this job posting.")
        return Application.objects.filter(job=job).select_related("candidate", "candidate__candidate_profile")


class ApplicationStatusUpdateView(generics.UpdateAPIView):
    """Recruiter: change an applicant's status (shortlist/reject/hire/etc)."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    serializer_class = ApplicationStatusUpdateSerializer
    queryset = Application.objects.all()
    lookup_url_kwarg = "application_id"

    def get_object(self):
        application = get_object_or_404(Application, id=self.kwargs["application_id"])
        if application.job.recruiter_id != self.request.user.id:
            raise PermissionDenied("You do not own this job posting.")
        return application

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response(ApplicationRecruiterSerializer(self.get_object()).data)


class DownloadResumeView(APIView):
    """Recruiter: download the resume snapshot attached to a specific application."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request, application_id):
        application = get_object_or_404(Application, id=application_id)
        if application.job.recruiter_id != request.user.id:
            raise PermissionDenied("You do not own this job posting.")
        if not application.resume_snapshot:
            raise ValidationError("No resume file found for this application.")
        return FileResponse(
            application.resume_snapshot.open("rb"),
            as_attachment=True,
            filename=application.resume_snapshot.name.split("/")[-1],
        )
