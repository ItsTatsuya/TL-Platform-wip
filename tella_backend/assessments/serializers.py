from rest_framework import serializers

from .models import (
    AssessmentAnswer, AssessmentAttempt, CaseStudy, CaseStudyQuestion,
    LearningCheck, LearningCheckQuestion, Question, QuestionOption,
)


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = "__all__"


class LearningCheckQuestionSerializer(serializers.ModelSerializer):
    question_detail = QuestionSerializer(source="question", read_only=True)

    class Meta:
        model = LearningCheckQuestion
        fields = "__all__"


class LearningCheckSerializer(serializers.ModelSerializer):
    questions = LearningCheckQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = LearningCheck
        fields = "__all__"


class CaseStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = "__all__"


class CaseStudyQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudyQuestion
        fields = "__all__"


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAttempt
        fields = "__all__"
        read_only_fields = ("student", "attempt_number", "score", "max_score", "percentage", "status", "passed", "submitted_at")


class SubmitAttemptSerializer(serializers.Serializer):
    attempt_id = serializers.UUIDField(required=False)
    answers = serializers.ListField(child=serializers.DictField(), allow_empty=True)
    time_spent_seconds = serializers.IntegerField(min_value=0, required=False, default=0)


class AssessmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAnswer
        fields = "__all__"
