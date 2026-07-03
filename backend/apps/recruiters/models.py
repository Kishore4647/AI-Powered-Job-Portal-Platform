import uuid
from django.conf import settings
from django.db import models


def logo_upload_path(instance, filename):
    return f"company_logos/{instance.user.id}/{filename}"


class CompanyProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_profile")

    company_name = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=150, blank=True)
    company_size = models.CharField(max_length=50, blank=True, help_text="e.g. '1-10', '11-50', '500+'")
    location = models.CharField(max_length=150, blank=True)
    about = models.TextField(blank=True)
    logo = models.ImageField(upload_to=logo_upload_path, null=True, blank=True)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name or self.user.email
