import tempfile

from django.contrib.auth.models import Group
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from accounts.constants import GroupName
from accounts.models import User
from curriculum.models import Chapter, Course, CourseVersion, Program
from portal.forms import ChapterForm


class PortalTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("setup_groups", verbosity=0)
        cls.admin = User.objects.create_user(email="portal-admin@example.com", password="pass12345")
        cls.admin.groups.add(Group.objects.get(name=GroupName.ADMIN))
        cls.content = User.objects.create_user(email="portal-content@example.com", password="pass12345")
        cls.content.groups.add(Group.objects.get(name=GroupName.CONTENT_MANAGER))

    def test_admin_can_open_dashboard_and_curriculum_list(self):
        self.client.force_login(self.admin)
        self.assertEqual(self.client.get(reverse("portal-dashboard")).status_code, 200)
        self.assertEqual(self.client.get(reverse("portal-list", args=["programs"])).status_code, 200)

    def test_content_manager_cannot_open_user_access(self):
        self.client.force_login(self.content)
        self.assertEqual(self.client.get(reverse("portal-user-access", args=[self.admin.id])).status_code, 403)

    def test_content_manager_can_open_authorized_content_resources(self):
        self.client.force_login(self.content)
        self.assertEqual(self.client.get(reverse("portal-list", args=["experiments"])).status_code, 200)
        self.assertEqual(self.client.get(reverse("portal-create", args=["media-assets"])).status_code, 200)

    def test_content_manager_can_upload_media_from_portal(self):
        self.client.force_login(self.content)
        with tempfile.TemporaryDirectory() as media_root, self.settings(MEDIA_ROOT=media_root):
            response = self.client.post(
                reverse("portal-create", args=["media-assets"]),
                {"upload": SimpleUploadedFile("portal-video.mp4", b"video", content_type="video/mp4")},
            )
            self.assertEqual(response.status_code, 302)
            self.assertTrue(self.content.media_assets_uploaded.filter(file_name="portal-video.mp4", status="READY").exists())

    def test_admin_cannot_assign_super_admin(self):
        self.client.force_login(self.admin)
        response = self.client.post(reverse("portal-user-access", args=[self.content.id]), {"group": Group.objects.get(name=GroupName.SUPER_ADMIN).id, "action": "add"})
        self.assertEqual(response.status_code, 403)
        self.assertFalse(self.content.groups.filter(name=GroupName.SUPER_ADMIN).exists())

    def test_super_admin_can_open_group_permissions(self):
        superuser = User.objects.create_superuser(email="portal-super@example.com", password="pass12345", username="portal-super")
        self.client.force_login(superuser)
        self.assertEqual(self.client.get(reverse("portal-groups")).status_code, 200)

    def test_chapter_completion_controls_become_json(self):
        program = Program.objects.create(name="Rules", code="rules-program")
        course = Course.objects.create(program=program, name="Rules course", code="rules-course")
        version = CourseVersion.objects.create(course=course, version_number=1, name="Version 1")
        form = ChapterForm(data={
            "course_version": version.id, "title": "Chapter", "slug": "chapter",
            "description": "", "chapter_number": 1, "estimated_minutes": 20,
            "is_required": "on", "status": "DRAFT", "display_order": 0,
            "require_subtopics": "on", "require_case_study": "on",
            "require_learning_check": "on", "learning_check_pass_percentage": 80,
        })
        self.assertTrue(form.is_valid(), form.errors)
        chapter = form.save()
        self.assertEqual(chapter.completion_rule, {"required_subtopics": True, "case_study_required": True, "learning_check_required": True, "learning_check_pass_percentage": 80})
