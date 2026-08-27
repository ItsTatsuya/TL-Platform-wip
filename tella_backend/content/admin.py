from django.contrib import admin

from .models import ActivityContent, Experiment, PracticeItem, PracticeSet, Video


class PracticeItemInline(admin.TabularInline):
    model = PracticeItem
    extra = 0


@admin.register(PracticeSet)
class PracticeSetAdmin(admin.ModelAdmin):
    list_display = ("title", "activity", "passing_score", "display_order")
    inlines = [PracticeItemInline]


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "activity", "media_asset", "duration_seconds", "completion_percentage")


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ("activity", "experiment_type", "external_url")
    list_filter = ("experiment_type",)


admin.site.register(ActivityContent)
