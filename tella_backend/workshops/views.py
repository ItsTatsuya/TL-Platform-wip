from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import WorkshopModel
from .serializers import WorkshopModelSerializer


class WorkshopModelViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopModelSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def get_queryset(self):
        qs = WorkshopModel.objects.filter(user=self.request.user)
        activity = self.request.query_params.get("activity")
        if activity:
            qs = qs.filter(activity_id=activity)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
