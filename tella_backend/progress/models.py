import uuid

from django.conf import settings
from django.db import models

from curriculum.models import Chapter, LearningActivity, Subtopic
from students.models import Enrollment


class TimestampedUUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CourseProgress(TimestampedUUIDModel):
    enrollment = models.OneToOneField(
        Enrollment, on_delete=models.CASCADE, related_name="course_progress"
    )
    percent_complete = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_activity_at = models.DateTimeField(null=True, blank=True)


class ChapterProgress(TimestampedUUIDModel):
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="chapter_progress"
    )
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    percent_complete = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        unique_together = ("enrollment", "chapter")


class SubtopicProgress(TimestampedUUIDModel):
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="subtopic_progress"
    )
    subtopic = models.ForeignKey(Subtopic, on_delete=models.CASCADE)
    percent_complete = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        unique_together = ("enrollment", "subtopic")


class ActivityProgress(TimestampedUUIDModel):
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="activity_progress"
    )
    activity = models.ForeignKey(LearningActivity, on_delete=models.CASCADE)
    status = models.CharField(max_length=32, default="not_started")
    extra = models.JSONField(default=dict, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("enrollment", "activity")


class AssessmentAttempt(TimestampedUUIDModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assessment_attempts"
    )
    activity = models.ForeignKey(LearningActivity, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)


class AssessmentAnswer(TimestampedUUIDModel):
    attempt = models.ForeignKey(
        AssessmentAttempt, on_delete=models.CASCADE, related_name="answers"
    )
    question_key = models.CharField(max_length=80)
    answer = models.JSONField(default=dict)
    is_correct = models.BooleanField(null=True, blank=True)


class PointEvent(TimestampedUUIDModel):
    class Reason(models.TextChoices):
        LOAD_SAMPLE = "load_sample", "Loaded sample"
        EXPLORE_SLOPES = "explore_slopes", "Explored both slopes"
        REACH_PEAK = "reach_peak", "Reached the peak"
        EXPORT_REPORT = "export_report", "Exported report"

    POINTS = {
        Reason.LOAD_SAMPLE: 10,
        Reason.EXPLORE_SLOPES: 25,
        Reason.REACH_PEAK: 50,
        Reason.EXPORT_REPORT: 20,
    }

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="point_events"
    )
    activity = models.ForeignKey(
        LearningActivity, on_delete=models.CASCADE, related_name="point_events"
    )
    reason = models.CharField(max_length=32, choices=Reason.choices)
    points = models.PositiveIntegerField()

    class Meta:
        unique_together = ("user", "activity", "reason")


class BadgeAward(TimestampedUUIDModel):
    class Code(models.TextChoices):
        FIRST_PEAK = "first_peak", "First Peak"
        SLOPE_READER = "slope_reader", "Slope Reader"
        BUSINESS_OPTIMISER = "business_optimiser", "Business Optimiser"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="badges"
    )
    activity = models.ForeignKey(
        LearningActivity, on_delete=models.CASCADE, related_name="badges"
    )
    code = models.CharField(max_length=40, choices=Code.choices)

    class Meta:
        unique_together = ("user", "activity", "code")


class CareerOpportunity(TimestampedUUIDModel):
    title = models.CharField(max_length=200)
    kind = models.CharField(max_length=40, default="internship")
    summary = models.TextField(blank=True)
    url = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
