from rest_framework import serializers
from .models import CompanyProfile


class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CompanyProfile
        fields = [
            "id", "email", "company_name", "website", "industry", "company_size",
            "location", "about", "logo", "contact_person", "contact_email",
            "contact_phone", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
