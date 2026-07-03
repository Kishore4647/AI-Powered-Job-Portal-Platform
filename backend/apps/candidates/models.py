import uuid
from django.conf import settings
from django.db import models


def resume_upload_path(instance, filename):
    return f"resumes/{instance.user.id}/{filename}"


class CandidateProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="candidate_profile")

    full_name = models.CharField(max_length=150, blank=True)
    headline = models.CharField(max_length=200, blank=True, help_text="e.g. 'Python Developer | Django | React'")
    summary = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    resume = models.FileField(upload_to=resume_upload_path, null=True, blank=True)
    resume_text = models.TextField(blank=True, help_text="Extracted plain text of the resume, used for AI features.")
    resume_updated_at = models.DateTimeField(null=True, blank=True)

    profile_completion = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.email


class Education(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="education")
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=150, blank=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["-end_year"]


class Experience(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="experience")
    company_name = models.CharField(max_length=200)
    job_title = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("profile", "name")
