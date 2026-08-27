from django.contrib import admin

from .models import Chapter, Course, CourseVersion, LearningActivity, Program, Subtopic


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "grade", "status")
    list_filter = ("status", "grade")
    search_fields = ("name", "code")
    prepopulated_fields = {"code": ("name",)}


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "program", "status", "display_order")
    list_filter = ("status", "program")
    search_fields = ("name", "code")
    prepopulated_fields = {"code": ("name",)}


@admin.register(CourseVersion)
class CourseVersionAdmin(admin.ModelAdmin):
    list_display = ("course", "version_number", "name", "status", "published_at")
    list_filter = ("status",)


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "course_version", "chapter_number", "status", "display_order")
    list_filter = ("status",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Subtopic)
class SubtopicAdmin(admin.ModelAdmin):
    list_display = ("title", "chapter", "status", "display_order")
    list_filter = ("status",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(LearningActivity)
class LearningActivityAdmin(admin.ModelAdmin):
    list_display = ("title", "activity_type", "subtopic", "status", "display_order")
    list_filter = ("activity_type", "status")

