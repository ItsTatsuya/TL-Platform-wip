from django.contrib.auth.models import Group
from django.core.exceptions import PermissionDenied
from django.db import transaction

from .constants import GroupName, PROTECTED_GROUPS


@transaction.atomic
def assign_group(*, actor, user, group: Group) -> None:
    if not actor.has_perm("accounts.manage_users"):
        raise PermissionDenied("You cannot manage user groups.")
    if group.name in PROTECTED_GROUPS and not actor.has_perm("accounts.manage_permissions"):
        raise PermissionDenied("Only permission administrators can assign SUPER_ADMIN.")
    if user == actor and group.name == GroupName.SUPER_ADMIN and not actor.is_superuser:
        raise PermissionDenied("Self-escalation is not permitted.")
    user.groups.add(group)
