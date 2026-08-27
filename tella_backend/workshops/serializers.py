from rest_framework import serializers

from .math import validate_config
from .models import WorkshopModel


class WorkshopModelSerializer(serializers.ModelSerializer):
    validation = serializers.SerializerMethodField()

    class Meta:
        model = WorkshopModel
        fields = (
            "id",
            "activity",
            "user",
            "name",
            "config",
            "validation",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at", "validation")

    def get_validation(self, obj):
        return validate_config(obj.config or {})

    def validate_config(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Config must be an object.")
        result = validate_config(value)
        if result.get("errors"):
            raise serializers.ValidationError(result["errors"])
        return value
