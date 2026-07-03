from django.utils import timezone
from rest_framework import generics, permissions, viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsCandidate
from .models import CandidateProfile, Education, Experience, Skill
from .serializers import (
    CandidateProfileSerializer, EducationSerializer, ExperienceSerializer,
    SkillSerializer, ResumeUploadSerializer,
)
from .utils import extract_resume_text


class MyProfileView(APIView):
    """GET/PUT/PATCH the logged-in candidate's own profile (auto-created on first access)."""
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.username}
        )
        return profile

    def get(self, request):
        profile = self.get_object(request)
        return Response(CandidateProfileSerializer(profile).data)

    def patch(self, request):
        profile = self.get_object(request)
        serializer = CandidateProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ResumeUploadView(APIView):
    """POST a resume file. Extracts text server-side for later AI analysis."""
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = ResumeUploadSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        extracted_text = extract_resume_text(profile.resume)
        profile.resume_text = extracted_text
        profile.save(update_fields=["resume_text"])

        return Response(CandidateProfileSerializer(profile).data, status=status.HTTP_201_CREATED)


class BaseOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get_profile(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get_queryset(self):
        return self.queryset.filter(profile=self.get_profile())

    def perform_create(self, serializer):
        serializer.save(profile=self.get_profile())


class EducationViewSet(BaseOwnedViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class ExperienceViewSet(BaseOwnedViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer


class SkillViewSet(BaseOwnedViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
