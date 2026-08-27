from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import CourseAssignment, Enrollment, ExternalUserMapping, StudentGroup, StudentGroupMember

User = get_user_model()


class StudentGroupMemberSerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source="student", read_only=True)

    class Meta:
        model = StudentGroupMember
        fields = ("id", "student_group", "student", "student_detail", "joined_at")
        read_only_fields = ("joined_at",)


class StudentGroupSerializer(serializers.ModelSerializer):
    memberships = StudentGroupMemberSerializer(many=True, read_only=True)

    class Meta:
        model = StudentGroup
        fields = ("id", "name", "code", "grade", "academic_year", "teacher", "status", "created_at", "updated_at", "memberships")
        read_only_fields = ("created_at", "updated_at")


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = (
            "id", "student", "course", "course_version", "status", "enrolled_at",
            "started_at", "completed_at", "expires_at", "created_at", "updated_at",
        )
        read_only_fields = ("enrolled_at", "created_at", "updated_at")


class CourseAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAssignment
        fields = (
            "id", "course", "course_version", "student_group", "student", "assigned_by",
            "assigned_at", "due_date", "status", "created_at", "updated_at",
        )
        read_only_fields = ("assigned_by", "assigned_at", "created_at", "updated_at")

    def validate(self, attrs):
        if (attrs.get("student_group") is None) == (attrs.get("student") is None):
            raise serializers.ValidationError("Exactly one of student_group or student is required.")
        return attrs


class ExternalUserMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalUserMapping
        fields = ("id", "user", "provider", "external_user_id", "metadata", "created_at")
        read_only_fields = ("created_at",)
