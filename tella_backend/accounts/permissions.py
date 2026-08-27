from rest_framework.permissions import BasePermission

from .constants import GroupName


def user_in_group(user, group_name: str) -> bool:
    return bool(user and user.is_authenticated and user.groups.filter(name=group_name).exists())


class IsInDjangoGroup(BasePermission):
    group_name = ""

    def has_permission(self, request, view) -> bool:
        return bool(request.user.is_superuser or user_in_group(request.user, self.group_name))


class IsSuperAdmin(IsInDjangoGroup):
    group_name = GroupName.SUPER_ADMIN


class IsAdmin(IsInDjangoGroup):
    group_name = GroupName.ADMIN


class IsAcademicManager(IsInDjangoGroup):
    group_name = GroupName.ACADEMIC_MANAGER


class IsContentManager(IsInDjangoGroup):
    group_name = GroupName.CONTENT_MANAGER


class IsTeacher(IsInDjangoGroup):
    group_name = GroupName.TEACHER


class IsStudent(IsInDjangoGroup):
    group_name = GroupName.STUDENT


class HasDjangoPermission(BasePermission):
    required_permission = ""

    def has_permission(self, request, view) -> bool:
        return bool(request.user.is_authenticated and request.user.has_perm(self.required_permission))


class CanManageUsers(HasDjangoPermission):
    required_permission = "accounts.manage_users"


class CanManagePermissions(HasDjangoPermission):
    required_permission = "accounts.manage_permissions"
