import uuid

from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.constants import GroupName
from accounts.models import User
from curriculum.models import Chapter, Course, CourseVersion, LearningActivity, Program, PublishStatus, Subtopic
from media_library.models import MediaAsset
from students.models import Enrollment

from .models import ActivityContent, Experiment, PracticeItem, PracticeSet, Video
from .services import create_experiment, create_video, reorder_practice_items


class ContentFixtureMixin:
    @classmethod
    def setUpTestData(cls):
        call_command("setup_groups", verbosity=0)
        cls.manager = User.objects.create_user(email="phase3-content@example.com", username="phase3-content", password="pass")
        cls.manager.groups.add(Group.objects.get(name=GroupName.CONTENT_MANAGER))
        cls.student = User.objects.create_user(email="phase3-student@example.com", username="phase3-student", password="pass")
        cls.student.groups.add(Group.objects.get(name=GroupName.STUDENT))
        cls.program = Program.objects.create(name="Program", code="phase3-program", status=PublishStatus.PUBLISHED)
        cls.course = Course.objects.create(program=cls.program, name="Course", code="phase3-course", status=PublishStatus.PUBLISHED)
        cls.version = CourseVersion.objects.create(course=cls.course, version_number=2026, name="2026", status=PublishStatus.PUBLISHED)
        cls.chapter = Chapter.objects.create(course_version=cls.version, title="Chapter", slug="phase3-chapter", chapter_number=1, status=PublishStatus.PUBLISHED)
        cls.subtopic = Subtopic.objects.create(chapter=cls.chapter, title="Subtopic", slug="phase3-subtopic", status=PublishStatus.PUBLISHED)
        cls.video_activity = LearningActivity.objects.create(subtopic=cls.subtopic, activity_type=LearningActivity.ActivityType.CONCEPT_VIDEO, title="Video", display_order=0, status=PublishStatus.PUBLISHED)
        cls.practice_activity = LearningActivity.objects.create(subtopic=cls.subtopic, activity_type=LearningActivity.ActivityType.OBSERVE_LEARN_PRACTICE, title="Practice", display_order=1, status=PublishStatus.PUBLISHED)
        cls.experiment_activity = LearningActivity.objects.create(subtopic=cls.subtopic, activity_type=LearningActivity.ActivityType.EXPERIMENT, title="Experiment", display_order=2, status=PublishStatus.PUBLISHED)
        cls.media = MediaAsset.objects.create(file_name="lesson.mp4", file_type="VIDEO", mime_type="video/mp4", file_size=1024, storage_path="courses/lesson.mp4", status=MediaAsset.Status.READY, uploaded_by=cls.manager)
        cls.video = Video.objects.create(activity=cls.video_activity, media_asset=cls.media, title="Lesson", duration_seconds=120)


class ContentModelServiceTests(ContentFixtureMixin, TestCase):
    def test_video_default_completion_is_ninety_percent(self):
        self.assertEqual(self.video.completion_percentage, 90)

    def test_video_requires_video_activity_type(self):
        with self.assertRaises(ValidationError):
            create_video(actor=self.manager, activity=self.experiment_activity, media_asset=self.media, title="Wrong", duration_seconds=20)

    def test_experiment_requires_compatible_activity_type(self):
        with self.assertRaises(ValidationError):
            create_experiment(actor=self.manager, activity=self.video_activity, experiment_type=Experiment.ExperimentType.EMBEDDED, instructions="Do it")

    def test_practice_item_database_constraint_matches_type(self):
        practice_set = PracticeSet.objects.create(activity=self.practice_activity, title="Set")
        with self.assertRaises(IntegrityError), transaction.atomic():
            PracticeItem.objects.create(practice_set=practice_set, item_type=PracticeItem.ItemType.VIDEO, display_order=0)

    def test_practice_item_sequence_reorders_safely(self):
        practice_set = PracticeSet.objects.create(activity=self.practice_activity, title="Set")
        first = PracticeItem.objects.create(practice_set=practice_set, item_type=PracticeItem.ItemType.VIDEO, video=self.video, display_order=0)
        second = PracticeItem.objects.create(practice_set=practice_set, item_type=PracticeItem.ItemType.QUESTION, question_reference=uuid.uuid4(), display_order=1)
        reorder_practice_items(actor=self.manager, practice_set=practice_set, ordered_ids=[second.id, first.id])
        first.refresh_from_db(); second.refresh_from_db()
        self.assertEqual((second.display_order, first.display_order), (0, 1))

    def test_activity_content_stores_flexible_json(self):
        record = ActivityContent.objects.create(activity=self.experiment_activity, content_type="application/vnd.tella.overview+json", content={"blocks": [{"type": "text"}]})
        self.assertEqual(record.content["blocks"][0]["type"], "text")


class ContentApiTests(ContentFixtureMixin, TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_content_manager_can_create_media_metadata(self):
        self.client.force_authenticate(self.manager)
        response = self.client.post(reverse("media-asset-list"), {
            "file_name": "second.mp4", "file_type": "VIDEO", "mime_type": "video/mp4",
            "file_size": 2048, "storage_path": "courses/second.mp4", "status": "READY",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["uploaded_by"], self.manager.id)

    def test_content_manager_can_create_and_patch_activity_content(self):
        self.client.force_authenticate(self.manager)
        created = self.client.post(reverse("activity-content-list"), {
            "activity": str(self.experiment_activity.id),
            "content_type": "application/vnd.tella.overview+json",
            "content": {"title": "Overview", "extra": {"preserved": True}},
        }, format="json")
        self.assertEqual(created.status_code, 201)
        updated = self.client.patch(reverse("activity-content-detail", args=[created.data["id"]]), {
            "content": {"title": "Updated", "extra": {"preserved": True}},
        }, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["content"]["title"], "Updated")
        self.assertTrue(updated.data["content"]["extra"]["preserved"])

    def test_student_cannot_create_or_patch_activity_content(self):
        record = ActivityContent.objects.create(activity=self.experiment_activity, content={"title": "Original"})
        Enrollment.objects.create(student=self.student, course=self.course, course_version=self.version)
        self.client.force_authenticate(self.student)
        created = self.client.post(reverse("activity-content-list"), {
            "activity": str(self.practice_activity.id), "content": {},
        }, format="json")
        updated = self.client.patch(reverse("activity-content-detail", args=[record.id]), {
            "content": {"title": "No"},
        }, format="json")
        self.assertEqual(created.status_code, 403)
        self.assertEqual(updated.status_code, 403)

    def test_student_reads_video_for_enrolled_published_course(self):
        Enrollment.objects.create(student=self.student, course=self.course, course_version=self.version)
        self.client.force_authenticate(self.student)
        response = self.client.get(reverse("video-detail", args=[self.video.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["media_asset"], self.media.id)

    def test_student_cannot_read_video_without_enrollment(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(reverse("video-detail", args=[self.video.id])).status_code, 404)

    def test_student_media_list_only_contains_accessible_assets(self):
        Enrollment.objects.create(student=self.student, course=self.course, course_version=self.version)
        MediaAsset.objects.create(file_name="private.mp4", file_type="VIDEO", mime_type="video/mp4", storage_path="private/private.mp4", status="READY")
        self.client.force_authenticate(self.student)
        response = self.client.get(reverse("media-asset-list"))
        self.assertEqual([row["id"] for row in response.data], [str(self.media.id)])

    def test_student_cannot_create_video(self):
        Enrollment.objects.create(student=self.student, course=self.course, course_version=self.version)
        self.client.force_authenticate(self.student)
        response = self.client.post(reverse("video-list"), {
            "activity": str(self.video_activity.id), "media_asset": str(self.media.id),
            "title": "No", "duration_seconds": 10,
        }, format="json")
        self.assertEqual(response.status_code, 403)
