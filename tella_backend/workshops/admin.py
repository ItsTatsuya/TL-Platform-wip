from django.contrib import admin

from .models import WorkshopConfig, WorkshopModel


@admin.register(WorkshopConfig)
class WorkshopConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "activity", "product1_label", "product2_label", "updated_at")
    search_fields = ("name", "activity__title")


@admin.register(WorkshopModel)
class WorkshopModelAdmin(admin.ModelAdmin):
    list_display = ("name", "activity", "user", "updated_at")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")
