import tempfile
from io import StringIO
from pathlib import Path

from django.contrib.auth.models import Group, Permission
from django.core.exceptions import PermissionDenied
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from .constants import GroupName
from .models import User
from .services import assign_group
from curriculum.models import Course, LearningActivity
from students.models import Enrollment


class AuthenticationApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("setup_groups", verbosity=0)
        cls.user = User.objects.create_user(
            email="student@example.com", username="student", password="StrongPass123!"
        )
        cls.user.groups.add(Group.objects.get(name=GroupName.STUDENT))

    def setUp(self):
        self.client = APIClient()

    def login(self):
        return self.client.post(reverse("accounts:login"), {
            "email": self.user.email, "password": "StrongPass123!",
        }, format="json")

    def test_login_returns_token_pair(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login_is_rejected(self):
        response = self.client.post(reverse("accounts:login"), {
            "email": self.user.email, "password": "wrong",
        }, format="json")
        self.assertEqual(response.status_code, 401)

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])
        self.assertEqual(self.login().status_code, 401)

    def test_refresh_rotates_and_blacklists_old_token(self):
        refresh = self.login().data["refresh"]
        jti = str(RefreshToken(refresh)["jti"])
        response = self.client.post(reverse("accounts:refresh"), {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("refresh", response.data)
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=jti).exists())

    def test_logout_blacklists_refresh_token(self):
        login = self.login().data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login['access']}")
        response = self.client.post(reverse("accounts:logout"), {"refresh": login["refresh"]}, format="json")
        self.assertEqual(response.status_code, 204)

    def test_me_returns_groups_and_permissions(self):
        login = self.login().data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login['access']}")
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertIn(GroupName.STUDENT, response.data["groups"])
        self.assertIn("accounts.view_user", response.data["permissions"])


class GroupPermissionTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("setup_groups", verbosity=0)

    def test_all_groups_exist_and_command_is_idempotent(self):
        call_command("setup_groups", verbosity=0)
        self.assertSetEqual(set(Group.objects.values_list("name", flat=True)), set(GroupName.values))

    def test_super_admin_receives_all_permissions(self):
        group = Group.objects.get(name=GroupName.SUPER_ADMIN)
        self.assertEqual(group.permissions.count(), Permission.objects.count())

    def test_admin_cannot_manage_permissions(self):
        admin = User.objects.create_user(email="admin@example.com", username="admin", password="pass")
        admin.groups.add(Group.objects.get(name=GroupName.ADMIN))
        self.assertTrue(admin.has_perm("accounts.manage_users"))
        self.assertFalse(admin.has_perm("accounts.manage_permissions"))

    def test_admin_cannot_escalate_to_super_admin(self):
        admin = User.objects.create_user(email="admin@example.com", username="admin", password="pass")
        admin.groups.add(Group.objects.get(name=GroupName.ADMIN))
        target = User.objects.create_user(email="target@example.com", username="target", password="pass")
        with self.assertRaises(PermissionDenied):
            assign_group(actor=admin, user=target, group=Group.objects.get(name=GroupName.SUPER_ADMIN))
        self.assertFalse(target.groups.filter(name=GroupName.SUPER_ADMIN).exists())


class DemoSeedCommandTests(TestCase):
    def test_seed_creates_separate_role_accounts_and_student_enrollment(self):
        output = StringIO()
        call_command("setup_groups", stdout=output)
        call_command("seed_workshop", stdout=output)
        call_command("seed_workshop", stdout=output)

        admin = User.objects.get(email="admin@example.com")
        manager = User.objects.get(email="content@example.com")
        student = User.objects.get(email="student@example.com")

        self.assertTrue(admin.check_password("Admin123!"))
        self.assertTrue(manager.check_password("Content123!"))
        self.assertTrue(student.check_password("Student123!"))
        self.assertSetEqual(set(admin.groups.values_list("name", flat=True)), {GroupName.SUPER_ADMIN, GroupName.ADMIN})
        self.assertSetEqual(set(manager.groups.values_list("name", flat=True)), {GroupName.CONTENT_MANAGER})
        self.assertSetEqual(set(student.groups.values_list("name", flat=True)), {GroupName.STUDENT})
        self.assertTrue(admin.is_superuser)
        self.assertFalse(manager.is_superuser)
        self.assertFalse(student.is_staff)
        self.assertEqual(
            Enrollment.objects.filter(student=student, status=Enrollment.Status.ACTIVE).count(),
            1,
        )

    def test_content_publisher_attaches_role_owned_data_driven_lessons(self):
        output = StringIO()
        call_command("setup_groups", stdout=output)
        call_command("seed_workshop", stdout=output)
        with tempfile.TemporaryDirectory() as temporary, self.settings(MEDIA_ROOT=temporary):
            lpp_video = Path(temporary, "LPP2.mp4")
            multivariable_video = Path(temporary, "Multivariable.mp4")
            lpp_video.write_bytes(b"lpp-video")
            multivariable_video.write_bytes(b"multivariable-video")
            call_command(
                "publish_learning_demo",
                lpp_video=lpp_video,
                multivariable_video=multivariable_video,
                stdout=output,
            )
            call_command(
                "publish_learning_demo",
                lpp_video=lpp_video,
                multivariable_video=multivariable_video,
                stdout=output,
            )

            student = User.objects.get(email="student@example.com")
            manager = User.objects.get(email="content@example.com")
            courses = Course.objects.filter(student_enrollments__student=student, student_enrollments__status=Enrollment.Status.ACTIVE)
            self.assertSetEqual(set(courses.values_list("name", flat=True)), {
                "Business Mathematics for Management Students",
                "AI for Business Management",
            })
            lpp = LearningActivity.objects.get(title="Workshop: Build and optimise the LPP model")
            self.assertEqual(lpp.experiment.configuration["renderer_config"]["workspace"]["type"], "linear_programming")
            self.assertFalse(lpp.experiment.configuration["renderer_config"].get("material_id"))
            multivariable = LearningActivity.objects.get(title="Workshop: Climb the profit hill")
            self.assertEqual(multivariable.status, "PUBLISHED")
            self.assertTrue(multivariable.is_required)
            self.assertEqual(
                multivariable.experiment.configuration["renderer_config"]["workspace"]["type"],
                "multivariable_profit",
            )
            self.assertFalse(multivariable.experiment.configuration["renderer_config"].get("material_id"))
            self.assertEqual(
                manager.media_assets_uploaded.filter(storage_path__startswith="demo/business-mathematics/").count(),
                2,
            )
