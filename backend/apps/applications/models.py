import uuid
from django.conf import settings
from django.db import models
from apps.jobs.models import Job


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        INTERVIEW = "INTERVIEW", "Interview Scheduled"
        REJECTED = "REJECTED", "Rejected"
        HIRED = "HIRED", "Hired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")

    # Snapshot of the resume used at time of application (candidate may update profile resume later)
    resume_snapshot = models.FileField(upload_to="application_resumes/")
    cover_letter = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    recruiter_notes = models.TextField(blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("job", "candidate")  # one-click apply, but only once per job
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.candidate} -> {self.job.title}"
