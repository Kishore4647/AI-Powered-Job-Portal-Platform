from django.urls import path
from .views import (
    ApplyToJobView, MyApplicationsView, JobApplicantsView,
    ApplicationStatusUpdateView, DownloadResumeView,
)

urlpatterns = [
    path("apply/", ApplyToJobView.as_view(), name="apply-to-job"),
    path("my-applications/", MyApplicationsView.as_view(), name="my-applications"),
    path("job/<uuid:job_id>/applicants/", JobApplicantsView.as_view(), name="job-applicants"),
    path("<uuid:application_id>/status/", ApplicationStatusUpdateView.as_view(), name="application-status"),
    path("<uuid:application_id>/resume/", DownloadResumeView.as_view(), name="download-resume"),
]
