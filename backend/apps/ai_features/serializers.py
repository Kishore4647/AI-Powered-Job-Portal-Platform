from rest_framework import serializers


class JobMatchRequestSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()


class CoverLetterRequestSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
