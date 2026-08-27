from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("file_name", "file_type", "mime_type", "file_size", "status", "uploaded_by", "created_at")
    list_filter = ("status", "file_type")
    search_fields = ("file_name", "storage_path", "mime_type")
