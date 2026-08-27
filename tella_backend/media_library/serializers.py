from rest_framework import serializers

from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = (
            "id", "file_name", "file_type", "mime_type", "file_size", "storage_path",
            "cdn_url", "duration_seconds", "uploaded_by", "created_at", "status",
        )
        read_only_fields = ("uploaded_by", "created_at")

    def validate_file_size(self, value):
        if value < 0:
            raise serializers.ValidationError("File size cannot be negative.")
        return value
