from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/candidates/", include("apps.candidates.urls")),
    path("api/recruiters/", include("apps.recruiters.urls")),
    path("api/jobs/", include("apps.jobs.urls")),
    path("api/applications/", include("apps.applications.urls")),
    path("api/ai/", include("apps.ai_features.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
