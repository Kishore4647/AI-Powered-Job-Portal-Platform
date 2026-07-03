from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "role", "is_verified", "is_active", "created_at")
    list_filter = ("role", "is_active", "is_verified")
    search_fields = ("email", "username")
    ordering = ("-created_at",)
    fieldsets = UserAdmin.fieldsets + (
        ("Role Info", {"fields": ("role", "phone", "is_verified")}),
    )
