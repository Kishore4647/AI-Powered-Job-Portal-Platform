from django.contrib import admin
from .models import AIInteractionLog

@admin.register(AIInteractionLog)
class AIInteractionLogAdmin(admin.ModelAdmin):
    list_display = ("user", "feature_type", "job", "created_at")
    list_filter = ("feature_type",)
