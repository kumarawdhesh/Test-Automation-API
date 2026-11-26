from django.urls import include, path
from django.contrib import admin
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/v1/", include("schema_api.urls")),
    path("api/", include("core.urls")),
]
