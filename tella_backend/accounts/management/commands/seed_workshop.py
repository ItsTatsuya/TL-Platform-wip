from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.db import transaction

from accounts.constants import GroupName
from accounts.models import User
from curriculum.models import (
    Chapter,
    Course,
    CourseVersion,
    LearningActivity,
    Program,
    Subtopic,
)
from progress.models import CareerOpportunity
from students.models import Enrollment
from workshops.math import SAMPLE_BAKERY
from workshops.models import WorkshopConfig, WorkshopModel


class Command(BaseCommand):
    help = "Seed roles, demo users, and the bakery multivariable workshop."

    @transaction.atomic
    def handle(self, *args, **options):
        groups = {name: Group.objects.get_or_create(name=name)[0] for name in GroupName.values}

        admin, created = User.objects.get_or_create(
            email="admin@example.com",
            defaults={
                "username": "admin",
                "first_name": "Tella",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created or not admin.check_password("Admin123!"):
            admin.set_password("Admin123!")
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
        admin.groups.add(groups[GroupName.SUPER_ADMIN], groups[GroupName.ADMIN])

        manager, created = User.objects.get_or_create(
            email="content@example.com",
            defaults={
                "username": "content-manager",
                "first_name": "Content",
                "last_name": "Manager",
                "is_staff": True,
            },
        )
        if created:
            manager.set_password("Admin123!")
            manager.is_staff = True
            manager.save()
        manager.groups.add(groups[GroupName.CONTENT_MANAGER])

        program, _ = Program.objects.get_or_create(
            code="business-mathematics-skill-path",
            defaults={
                "name": "Business Mathematics Skill Path",
                "description": "Applied modelling for business decisions.",
                "status": "PUBLISHED",
            },
        )
        program.status = "PUBLISHED"
        program.save()

        course, _ = Course.objects.get_or_create(
            program=program,
            code="multivariable-modelling-workshop",
            defaults={
                "name": "Multivariable Modelling Workshop",
                "description": "Interactive profit landscape workshop.",
                "status": "PUBLISHED",
            },
        )
        course.status = "PUBLISHED"
        course.save()

        version, _ = CourseVersion.objects.get_or_create(
            course=course,
            version_number=1,
            defaults={"name": "2026", "status": "PUBLISHED"},
        )
        version.status = "PUBLISHED"
        version.save()

        chapter, _ = Chapter.objects.get_or_create(
            course_version=version,
            title="Profit landscape",
            slug="profit-landscape",
            defaults={"chapter_number": 1, "display_order": 1, "status": "PUBLISHED"},
        )
        subtopic, _ = Subtopic.objects.get_or_create(
            chapter=chapter,
            title="Hold one input still",
            slug="hold-one-input-still",
            defaults={"display_order": 1, "status": "PUBLISHED"},
        )
        activity, _ = LearningActivity.objects.get_or_create(
            subtopic=subtopic,
            title="Bakery profit landscape",
            defaults={
                "activity_type": LearningActivity.ActivityType.INTERACTIVE_WORKSHOP,
                "display_order": 1,
                "status": "PUBLISHED",
            },
        )
        activity.activity_type = LearningActivity.ActivityType.INTERACTIVE_WORKSHOP
        activity.status = "PUBLISHED"
        activity.save()

        sample = SAMPLE_BAKERY
        config, _ = WorkshopConfig.objects.update_or_create(
            activity=activity,
            defaults={
                "name": sample["name"],
                "price1": sample["price1"],
                "price_drop1": sample["priceDrop1"],
                "cost1": sample["cost1"],
                "price2": sample["price2"],
                "price_drop2": sample["priceDrop2"],
                "cost2": sample["cost2"],
                "congestion": sample["congestion"],
                "fixed_cost": sample["fixedCost"],
                "current_x": sample["currentX"],
                "current_y": sample["currentY"],
                "product1_label": sample["labels"]["product1"],
                "product2_label": sample["labels"]["product2"],
                "unit1": sample["labels"]["unit1"],
                "unit2": sample["labels"]["unit2"],
                "currency": sample["labels"]["currency"],
            },
        )

        WorkshopModel.objects.update_or_create(
            activity=activity,
            user=None,
            name=sample["name"],
            defaults={"config": sample},
        )

        Enrollment.objects.get_or_create(student=admin, course=course, defaults={"course_version": version})
        Enrollment.objects.get_or_create(student=manager, course=course, defaults={"course_version": version})

        CareerOpportunity.objects.get_or_create(
            title="Bakery operations internship",
            defaults={
                "kind": "internship",
                "summary": "Apply modelling skills to a live production plan.",
                "url": "https://example.com/internships",
                "is_published": True,
            },
        )
        CareerOpportunity.objects.get_or_create(
            title="Earn-while-you-learn: retail analytics",
            defaults={
                "kind": "earn_while_learn",
                "summary": "Paid project work with partner firms.",
                "is_published": True,
            },
        )

        self.stdout.write(self.style.SUCCESS(f"Seeded workshop activity {activity.id}"))
        self.stdout.write(f"Course id: {course.id}")
        self.stdout.write("Admin login: admin@example.com / Admin123!")
