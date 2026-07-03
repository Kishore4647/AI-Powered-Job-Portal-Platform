from django.urls import path
from .views import ResumeSummaryView, JobMatchView, CoverLetterView

urlpatterns = [
    path("resume-summary/", ResumeSummaryView.as_view(), name="ai-resume-summary"),
    path("job-match/", JobMatchView.as_view(), name="ai-job-match"),
    path("cover-letter/", CoverLetterView.as_view(), name="ai-cover-letter"),
]
