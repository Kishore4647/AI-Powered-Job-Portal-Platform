import django_filters
from .models import Job


class JobFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    title = django_filters.CharFilter(field_name="title", lookup_expr="icontains")
    job_type = django_filters.CharFilter(field_name="job_type", lookup_expr="iexact")
    experience_level = django_filters.CharFilter(field_name="experience_level", lookup_expr="iexact")
    is_remote = django_filters.BooleanFilter(field_name="is_remote")
    skills = django_filters.CharFilter(method="filter_skills")
    salary_min = django_filters.NumberFilter(field_name="salary_min", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="salary_max", lookup_expr="lte")
    company = django_filters.CharFilter(field_name="company__company_name", lookup_expr="icontains")

    class Meta:
        model = Job
        fields = ["location", "title", "job_type", "experience_level", "is_remote", "salary_min", "salary_max", "company"]

    def filter_skills(self, queryset, name, value):
        skills = [s.strip() for s in value.split(",") if s.strip()]
        q = queryset
        for skill in skills:
            q = q.filter(skills_required__icontains=skill)
        return q
