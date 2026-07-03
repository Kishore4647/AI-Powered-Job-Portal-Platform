import uuid
from django.conf import settings
from django.db import models
from apps.recruiters.models import CompanyProfile


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Full-time"
        PART_TIME = "PART_TIME", "Part-time"
        INTERNSHIP = "INTERNSHIP", "Internship"
        CONTRACT = "CONTRACT", "Contract"
        REMOTE = "REMOTE", "Remote"

    class ExperienceLevel(models.TextChoices):
        FRESHER = "FRESHER", "Fresher"
        JUNIOR = "JUNIOR", "0-2 years"
        MID = "MID", "2-5 years"
        SENIOR = "SENIOR", "5+ years"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"
        DRAFT = "DRAFT", "Draft"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="jobs")
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name="jobs")

    title = models.CharField(max_length=200)
    description = models.TextField()
    responsibilities = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    skills_required = models.CharField(max_length=500, blank=True, help_text="Comma-separated skills")

    location = models.CharField(max_length=150)
    is_remote = models.BooleanField(default=False)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.FRESHER)

    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    application_deadline = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["location"]),
            models.Index(fields=["job_type"]),
        ]

    def __str__(self):
        return f"{self.title} @ {self.company.company_name}"
