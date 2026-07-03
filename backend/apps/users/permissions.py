from rest_framework.permissions import BasePermission


class IsCandidate(BasePermission):
    message = "Only candidate accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "CANDIDATE")


class IsRecruiter(BasePermission):
    message = "Only recruiter accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "RECRUITER")
