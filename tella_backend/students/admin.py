from django.contrib import admin

from .models import CourseAssignment, Enrollment, ExternalUserMapping, StudentGroup, StudentGroupMember

admin.site.register(StudentGroup)
admin.site.register(StudentGroupMember)
admin.site.register(Enrollment)
admin.site.register(CourseAssignment)
admin.site.register(ExternalUserMapping)
