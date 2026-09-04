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
from progress.views import ActivityProgressActionView, CareerOpportunityListView, GamificationMeView, ProgressUpsertView
from progress.progress_views import MyActivityProgressView, MyChapterProgressView, MyCourseProgressView, MyProgressView
from assessments.views import CaseStudyQuestionViewSet, CaseStudyViewSet, LearningCheckViewSet, QuestionOptionViewSet, QuestionViewSet
from students.views import (
    CourseAssignmentViewSet, EnrollmentViewSet, ExternalUserMappingViewSet,
    StudentGroupMemberViewSet, StudentGroupViewSet, StudentViewSet, TeacherViewSet,
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
router.register(r"teachers", TeacherViewSet, basename="teacher")
router.register(r"student-groups", StudentGroupViewSet, basename="student-group")
router.register(r"student-group-members", StudentGroupMemberViewSet, basename="student-group-member")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"course-assignments", CourseAssignmentViewSet, basename="course-assignment")
router.register(r"external-user-mappings", ExternalUserMappingViewSet, basename="external-user-mapping")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"question-options", QuestionOptionViewSet, basename="question-option")
router.register(r"case-studies", CaseStudyViewSet, basename="case-study")
router.register(r"case-study-questions", CaseStudyQuestionViewSet, basename="case-study-question")
router.register(r"learning-checks", LearningCheckViewSet, basename="learning-check")
router.register(r"workshop-models", WorkshopModelViewSet, basename="workshop-model")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("manage/", include("portal.urls")),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/", include(router.urls)),
    path("api/v1/progress/", ProgressUpsertView.as_view(), name="progress_upsert"),
    path("api/v1/activities/<uuid:activity_id>/<str:action>/", ActivityProgressActionView.as_view(), name="activity_progress_action"),
    path("api/v1/me/progress/", MyProgressView.as_view(), name="my_progress"),
    path("api/v1/me/courses/<uuid:course_id>/progress/", MyCourseProgressView.as_view(), name="my_course_progress"),
    path("api/v1/me/chapters/<uuid:chapter_id>/progress/", MyChapterProgressView.as_view(), name="my_chapter_progress"),
    path("api/v1/me/activities/<uuid:activity_id>/progress/", MyActivityProgressView.as_view(), name="my_activity_progress"),
    path("api/v1/gamification/me/", GamificationMeView.as_view(), name="gamification_me"),
    path("api/v1/career/opportunities/", CareerOpportunityListView.as_view(), name="career"),
    path("api/v1/health/", lambda request: JsonResponse({"ok": True})),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
