from django.contrib.auth import get_user_model
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.serializers import UserSerializer

from .permissions import CanAccessStudentDomain
from .selectors import (
    visible_assignments, visible_enrollments, visible_external_mappings,
    visible_memberships, visible_student_groups, visible_students,
)
from .serializers import (
    CourseAssignmentSerializer, EnrollmentSerializer, ExternalUserMappingSerializer,
    StudentGroupMemberSerializer, StudentGroupSerializer,
)
from .services import (
    add_student_to_group, create_course_assignment, create_enrollment,
    create_student_group, upsert_external_mapping,
)

User = get_user_model()


class StudentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, CanAccessStudentDomain]

    def get_queryset(self):
        return visible_students(self.request.user)


class StudentGroupViewSet(viewsets.ModelViewSet):
    serializer_class = StudentGroupSerializer
    permission_classes = [IsAuthenticated, CanAccessStudentDomain]

    def get_queryset(self):
        return visible_student_groups(self.request.user)

    def perform_create(self, serializer):
        serializer.instance = create_student_group(actor=self.request.user, **serializer.validated_data)

    @action(detail=True, methods=["post"], url_path="members")
    def add_member(self, request, pk=None):
        student = User.objects.get(pk=request.data.get("student"))
        membership = add_student_to_group(actor=request.user, student_group=self.get_object(), student=student)
        return Response(StudentGroupMemberSerializer(membership).data)


class StudentGroupMemberViewSet(viewsets.ModelViewSet):
    serializer_class = StudentGroupMemberSerializer
    permission_classes = [IsAuthenticated, CanAccessStudentDomain]

    def get_queryset(self):
        return visible_memberships(self.request.user)

    def perform_create(self, serializer):
        serializer.instance = add_student_to_group(actor=self.request.user, **serializer.validated_data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated, CanAccessStudentDomain]

    def get_queryset(self):
        return visible_enrollments(self.request.user)

    def perform_create(self, serializer):
        serializer.instance = create_enrollment(actor=self.request.user, **serializer.validated_data)


class CourseAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = CourseAssignmentSerializer
    permission_classes = [IsAuthenticated, CanAccessStudentDomain]

    def get_queryset(self):
        return visible_assignments(self.request.user)

    def perform_create(self, serializer):
        serializer.instance = create_course_assignment(actor=self.request.user, **serializer.validated_data)


class ExternalUserMappingViewSet(viewsets.ModelViewSet):
    serializer_class = ExternalUserMappingSerializer
    permission_classes = [IsAuthenticated, CanAccessStudentDomain]

    def get_queryset(self):
        return visible_external_mappings(self.request.user)

    def perform_create(self, serializer):
        serializer.instance = upsert_external_mapping(actor=self.request.user, **serializer.validated_data)
