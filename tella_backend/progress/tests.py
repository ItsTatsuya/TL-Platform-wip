from django.contrib.auth.models import Group
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.constants import GroupName
from accounts.models import User
from curriculum.models import Chapter, Course, CourseVersion, LearningActivity, Program, Subtopic
from students.models import Enrollment

from .models import ActivityProgress, ChapterProgress, CourseProgress, SubtopicProgress
from .services import ProgressService

# Create your tests here.


class ProgressServiceTests(TestCase):
    def setUp(self):
        call_command("setup_groups", verbosity=0)
        self.student = User.objects.create_user(email="progress-student@example.com", password="pass12345")
        self.student.groups.add(Group.objects.get(name=GroupName.STUDENT))
        program = Program.objects.create(name="Progress", code="progress-program", status="PUBLISHED")
        course = Course.objects.create(program=program, name="Progress course", code="progress-course", status="PUBLISHED")
        version = CourseVersion.objects.create(course=course, version_number=1, name="v1", status="PUBLISHED")
        chapter = Chapter.objects.create(course_version=version, title="Chapter", slug="chapter", chapter_number=1, display_order=1, status="PUBLISHED")
        subtopic = Subtopic.objects.create(chapter=chapter, title="Subtopic", slug="subtopic", display_order=1, status="PUBLISHED")
        self.activity = LearningActivity.objects.create(subtopic=subtopic, title="Activity", activity_type="READING", display_order=1, status="PUBLISHED")
        self.enrollment = Enrollment.objects.create(student=self.student, course=course, course_version=version)

    def test_completion_propagates_to_all_levels(self):
        ProgressService.complete_activity(student=self.student, activity=self.activity, enrollment=self.enrollment)
        activity = ActivityProgress.objects.get(enrollment=self.enrollment, activity=self.activity)
        self.assertEqual(activity.progress_percentage, 100)
        self.assertEqual(SubtopicProgress.objects.get(enrollment=self.enrollment).status, "COMPLETED")
        self.assertEqual(ChapterProgress.objects.get(enrollment=self.enrollment).progress_percentage, 100)
        self.assertEqual(CourseProgress.objects.get(enrollment=self.enrollment).progress_percentage, 100)

    def test_progress_api_requires_enrollment_and_returns_snapshot(self):
        client = APIClient()
        client.force_authenticate(self.student)
        response = client.post(f"/api/v1/activities/{self.activity.id}/progress/", {"progress_percentage": 50, "time_spent_seconds": 30}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["progress_percentage"], "50.00")
        self.assertEqual(client.get("/api/v1/me/progress/").status_code, 200)
