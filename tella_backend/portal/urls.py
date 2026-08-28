from django.urls import path

from . import views

urlpatterns = [
    path("", views.dashboard, name="portal-dashboard"),
    path("activities/<uuid:pk>/", views.activity_detail, name="portal-activity-detail"),
    path("<slug:resource>/", views.resource_list, name="portal-list"),
    path("<slug:resource>/new/", views.resource_create, name="portal-create"),
    path("<slug:resource>/<uuid:pk>/edit/", views.resource_edit, name="portal-edit"),
    path("access/users/<uuid:user_id>/", views.user_access, name="portal-user-access"),
    path("access/users/", views.users_access, name="portal-users"),
    path("access/groups/", views.groups_access, name="portal-groups"),
    path("access/groups/<int:group_id>/", views.group_permissions, name="portal-group-permissions"),
]
