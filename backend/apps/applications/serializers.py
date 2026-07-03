from rest_framework import serializers
from .models import Application


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "job", "cover_letter", "status", "applied_at"]
        read_only_fields = ["id", "status", "applied_at"]

    def validate_job(self, job):
        if job.status != job.Status.OPEN:
            raise serializers.ValidationError("This job is no longer accepting applications.")
        return job


class ApplicationCandidateSerializer(serializers.ModelSerializer):
    """What a candidate sees in 'My Applications'."""
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.company_name", read_only=True)
    location = serializers.CharField(source="job.location", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "job_title", "company_name", "location",
            "status", "cover_letter", "applied_at", "updated_at",
        ]


class ApplicationRecruiterSerializer(serializers.ModelSerializer):
    """What a recruiter sees for applicants on their job."""
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    candidate_name = serializers.SerializerMethodField()
    resume_url = serializers.FileField(source="resume_snapshot", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "candidate", "candidate_name", "candidate_email",
            "resume_url", "cover_letter", "status", "recruiter_notes",
            "applied_at", "updated_at",
        ]
        read_only_fields = ["id", "job", "candidate", "resume_url", "cover_letter", "applied_at"]

    def get_candidate_name(self, obj):
        profile = getattr(obj.candidate, "candidate_profile", None)
        return profile.full_name if profile else obj.candidate.username


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status", "recruiter_notes"]
