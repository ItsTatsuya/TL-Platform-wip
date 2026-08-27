from rest_framework import serializers

from .models import ActivityProgress, BadgeAward, CareerOpportunity, PointEvent


class ActivityProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityProgress
        fields = (
            "id",
            "activity",
            "status",
            "extra",
            "completed_at",
            "updated_at",
        )
        read_only_fields = ("id", "completed_at", "updated_at")


class ProgressUpsertSerializer(serializers.Serializer):
    activity = serializers.UUIDField()
    status = serializers.CharField(required=False, default="in_progress")
    extra = serializers.JSONField(required=False, default=dict)
    event = serializers.CharField(required=False, allow_blank=True)


class PointEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointEvent
        fields = ("id", "reason", "points", "created_at")


class BadgeAwardSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="get_code_display", read_only=True)

    class Meta:
        model = BadgeAward
        fields = ("id", "code", "label", "created_at")


class CareerOpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerOpportunity
        fields = ("id", "title", "kind", "summary", "url")
