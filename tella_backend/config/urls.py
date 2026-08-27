from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from curriculum.views import (
    ActivityViewSet, ChapterViewSet, CourseVersionViewSet, CourseViewSet,
    ProgramViewSet, SubtopicViewSet,
)
from content.views import ActivityContentViewSet, ExperimentViewSet, PracticeItemViewSet, PracticeSetViewSet, VideoViewSet
from media_library.views import MediaAssetViewSet
from progress.views import CareerOpportunityListView, GamificationMeView, ProgressUpsertView
from students.views import (
    CourseAssignmentViewSet, EnrollmentViewSet, ExternalUserMappingViewSet,
    StudentGroupMemberViewSet, StudentGroupViewSet, StudentViewSet,
)
from workshops.views import WorkshopModelViewSet

router = DefaultRouter()
router.register(r"programs", ProgramViewSet, basename="program")
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"course-versions", CourseVersionViewSet, basename="course-version")
router.register(r"chapters", ChapterViewSet, basename="chapter")
router.register(r"subtopics", SubtopicViewSet, basename="subtopic")
router.register(r"activities", ActivityViewSet, basename="activity")
router.register(r"activity-content", ActivityContentViewSet, basename="activity-content")
router.register(r"videos", VideoViewSet, basename="video")
router.register(r"experiments", ExperimentViewSet, basename="experiment")
router.register(r"practice-sets", PracticeSetViewSet, basename="practice-set")
router.register(r"practice-items", PracticeItemViewSet, basename="practice-item")
router.register(r"media-assets", MediaAssetViewSet, basename="media-asset")
router.register(r"students", StudentViewSet, basename="student")
router.register(r"student-groups", StudentGroupViewSet, basename="student-group")
router.register(r"student-group-members", StudentGroupMemberViewSet, basename="student-group-member")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"course-assignments", CourseAssignmentViewSet, basename="course-assignment")
router.register(r"external-user-mappings", ExternalUserMappingViewSet, basename="external-user-mapping")
router.register(r"workshop-models", WorkshopModelViewSet, basename="workshop-model")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/", include(router.urls)),
    path("api/v1/progress/", ProgressUpsertView.as_view(), name="progress_upsert"),
    path("api/v1/gamification/me/", GamificationMeView.as_view(), name="gamification_me"),
    path("api/v1/career/opportunities/", CareerOpportunityListView.as_view(), name="career"),
    path("api/v1/health/", lambda request: JsonResponse({"ok": True})),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
