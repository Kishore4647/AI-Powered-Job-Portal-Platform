import uuid
from django.conf import settings
from django.db import models
from apps.jobs.models import Job


class AIInteractionLog(models.Model):
    """Audit trail of Gemini AI feature usage, also useful for rate-limit analytics."""

    class FeatureType(models.TextChoices):
        RESUME_SUMMARY = "RESUME_SUMMARY", "Resume Summary"
        JOB_MATCH = "JOB_MATCH", "Resume vs Job Match"
        COVER_LETTER = "COVER_LETTER", "Cover Letter"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_interactions")
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_interactions")
    feature_type = models.CharField(max_length=30, choices=FeatureType.choices)
    response_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
