from django.urls import path, re_path

from .views import OperationView


urlpatterns = [
    path("operations/", OperationView.as_view(), name="operations"),
    re_path(r"^(?P<resource>.+)/?$", OperationView.as_view(), name="legacy-operation"),
]
