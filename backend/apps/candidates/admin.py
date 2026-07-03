from django.contrib import admin
from .models import CandidateProfile, Education, Experience, Skill

admin.site.register(CandidateProfile)
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Skill)
