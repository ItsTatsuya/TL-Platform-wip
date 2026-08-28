from django.contrib import admin

from .models import AssessmentAnswer, AssessmentAttempt, CaseStudy, CaseStudyQuestion, LearningCheck, LearningCheckQuestion, Question, QuestionOption

for model in (Question, QuestionOption, CaseStudy, CaseStudyQuestion, LearningCheck, LearningCheckQuestion, AssessmentAttempt, AssessmentAnswer):
    admin.site.register(model)
