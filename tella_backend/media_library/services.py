from django.core.exceptions import PermissionDenied

from .models import MediaAsset


def create_media_asset(*, actor, **data) -> MediaAsset:
    if not actor.has_perm("media_library.add_mediaasset"):
        raise PermissionDenied("You cannot create media assets.")
    return MediaAsset.objects.create(uploaded_by=actor, **data)
