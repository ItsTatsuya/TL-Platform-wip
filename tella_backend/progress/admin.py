from django.contrib import admin

from .models import (
    ActivityProgress,
    AssessmentAttempt,
    BadgeAward,
    CareerOpportunity,
    PointEvent,
)


@admin.register(ActivityProgress)
class ActivityProgressAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "activity", "status", "updated_at")


@admin.register(PointEvent)
class PointEventAdmin(admin.ModelAdmin):
    list_display = ("user", "reason", "points", "created_at")


@admin.register(BadgeAward)
class BadgeAwardAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "created_at")


@admin.register(CareerOpportunity)
class CareerOpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "is_published")


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "activity", "score", "submitted_at")
