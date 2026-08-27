from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "username", "first_name", "last_name", "display_name",
            "is_active", "date_joined", "groups", "permissions",
        )

    def get_groups(self, obj) -> list[str]:
        return list(obj.groups.order_by("name").values_list("name", flat=True))

    def get_permissions(self, obj) -> list[str]:
        return sorted(obj.get_all_permissions())


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["groups"] = list(user.groups.values_list("name", flat=True))
        return token
