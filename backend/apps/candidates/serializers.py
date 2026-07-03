from django.utils import timezone
from rest_framework import serializers
from .models import CandidateProfile, Education, Experience, Skill


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "institution", "degree", "field_of_study", "start_year", "end_year", "grade"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "company_name", "job_title", "location", "start_date", "end_date", "is_current", "description"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            "id", "email", "full_name", "headline", "summary", "location", "date_of_birth",
            "linkedin_url", "github_url", "portfolio_url", "resume", "resume_updated_at",
            "profile_completion", "education", "experience", "skills",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "resume_updated_at", "profile_completion", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.profile_completion = self._compute_completion(instance)
        instance.save()
        return instance

    @staticmethod
    def _compute_completion(profile):
        fields = [profile.full_name, profile.headline, profile.summary, profile.location, profile.resume]
        filled = sum(1 for f in fields if f)
        has_edu = profile.education.exists()
        has_exp = profile.experience.exists()
        has_skills = profile.skills.exists()
        total_points = len(fields) + 3
        earned = filled + int(has_edu) + int(has_exp) + int(has_skills)
        return round((earned / total_points) * 100)


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = ["resume"]

    def validate_resume(self, value):
        allowed_ext = (".pdf", ".doc", ".docx")
        if not value.name.lower().endswith(allowed_ext):
            raise serializers.ValidationError("Resume must be a PDF or Word document.")
        max_bytes = 5 * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError("Resume file must be under 5MB.")
        return value

    def update(self, instance, validated_data):
        instance.resume = validated_data["resume"]
        instance.resume_updated_at = timezone.now()
        instance.save()
        return instance
