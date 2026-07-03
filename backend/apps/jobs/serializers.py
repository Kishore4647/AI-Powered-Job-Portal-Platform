from rest_framework import serializers
from .models import Job


class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    company_logo = serializers.ImageField(source="company.logo", read_only=True)
    applicant_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "company_name", "company_logo", "location", "is_remote",
            "job_type", "experience_level", "salary_min", "salary_max", "status",
            "application_deadline", "applicant_count", "created_at",
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    company_logo = serializers.ImageField(source="company.logo", read_only=True)
    company_about = serializers.CharField(source="company.about", read_only=True)
    applicant_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "responsibilities", "requirements",
            "skills_required", "location", "is_remote", "job_type", "experience_level",
            "salary_min", "salary_max", "status", "application_deadline",
            "company_name", "company_logo", "company_about", "applicant_count",
            "created_at", "updated_at",
        ]


class JobWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "responsibilities", "requirements",
            "skills_required", "location", "is_remote", "job_type", "experience_level",
            "salary_min", "salary_max", "status", "application_deadline",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        smin = attrs.get("salary_min", getattr(self.instance, "salary_min", None))
        smax = attrs.get("salary_max", getattr(self.instance, "salary_max", None))
        if smin and smax and smin > smax:
            raise serializers.ValidationError("salary_min cannot exceed salary_max.")
        return attrs
