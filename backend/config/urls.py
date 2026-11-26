from django.urls import include, path
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


urlpatterns = [
    path("api/health/", health, name="health"),
    path("api/", include("core.urls")),
]
