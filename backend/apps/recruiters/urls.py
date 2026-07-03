from django.urls import path
from .views import MyCompanyView

urlpatterns = [
    path("company/", MyCompanyView.as_view(), name="my-company"),
]
