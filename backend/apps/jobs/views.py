from django.db.models import Count
from rest_framework import viewsets, permissions
from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.permissions import IsRecruiter
from apps.recruiters.models import CompanyProfile
from .models import Job
from .filters import JobFilter
from .serializers import JobListSerializer, JobDetailSerializer, JobWriteSerializer


class IsOwnerRecruiterOrReadOnly(BasePermission):
    """Anyone (authenticated) can read jobs. Only the owning recruiter can edit/delete."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == "RECRUITER"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.recruiter_id == request.user.id


class JobViewSet(viewsets.ModelViewSet):
    """
    Public-facing job listing (with pagination/filter/search) for candidates,
    and full CRUD for the owning recruiter.
    """
    permission_classes = [IsOwnerRecruiterOrReadOnly]
    filterset_class = JobFilter
    search_fields = ["title", "description", "skills_required", "company__company_name"]
    ordering_fields = ["created_at", "salary_min", "salary_max"]

    def get_queryset(self):
        qs = Job.objects.select_related("company", "recruiter").annotate(applicant_count=Count("applications"))
        user = self.request.user
        if self.action in ("list", "retrieve"):
            if user.is_authenticated and user.role == "RECRUITER" and self.request.query_params.get("mine") == "true":
                return qs.filter(recruiter=user)
            # Candidates / public browsing: only OPEN jobs
            return qs.filter(status=Job.Status.OPEN)
        # update/delete/create -> recruiter manages own jobs
        return qs.filter(recruiter=user) if user.is_authenticated else qs.none()

    def get_serializer_class(self):
        if self.action == "list":
            return JobListSerializer
        if self.action == "retrieve":
            return JobDetailSerializer
        return JobWriteSerializer

    def perform_create(self, serializer):
        company, _ = CompanyProfile.objects.get_or_create(user=self.request.user)
        serializer.save(recruiter=self.request.user, company=company)
