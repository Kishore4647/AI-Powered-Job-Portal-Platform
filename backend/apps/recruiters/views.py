from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsRecruiter
from .models import CompanyProfile
from .serializers import CompanyProfileSerializer


class MyCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, request):
        profile, _ = CompanyProfile.objects.get_or_create(user=request.user)
        return profile

    def get(self, request):
        return Response(CompanyProfileSerializer(self.get_object(request)).data)

    def patch(self, request):
        profile = self.get_object(request)
        serializer = CompanyProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
