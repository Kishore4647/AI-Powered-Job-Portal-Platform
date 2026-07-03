from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import MyProfileView, ResumeUploadView, EducationViewSet, ExperienceViewSet, SkillViewSet

router = DefaultRouter()
router.register("education", EducationViewSet, basename="education")
router.register("experience", ExperienceViewSet, basename="experience")
router.register("skills", SkillViewSet, basename="skills")

urlpatterns = [
    path("profile/", MyProfileView.as_view(), name="my-profile"),
    path("profile/resume/", ResumeUploadView.as_view(), name="resume-upload"),
    path("", include(router.urls)),
]
