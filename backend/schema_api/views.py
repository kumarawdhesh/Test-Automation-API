from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.exceptions import APIException
from rest_framework.response import Response

from . import models
from .serializers import serializer_for


MODEL_ROUTES = (
    ("app-users", models.AppUser),
    ("bucket-names", models.BucketName),
    ("environments", models.Environment),
    ("iris-responses", models.IrisResponse),
    ("test-objects", models.TestObject),
    ("test-object-configs", models.TestObjectConfig),
    ("test-case-configs", models.TestCaseConfig),
    ("test-suites", models.TestSuite),
    ("test-cases", models.TestCase),
    ("test-cycles", models.TestCycle),
    ("releases", models.Release),
    ("release-test-cycle-mappings", models.ReleaseTestCycleMapping),
    ("test-cycle-case-mappings", models.TestCycleCaseMapping),
    ("schedules", models.Scheduler),
    ("test-data-generation-audits", models.TestDataGenAudit),
    ("test-cycle-results", models.TestCycleResult),
    ("test-case-results", models.TestCaseResult),
    ("test-case-result-history", models.TestCaseResultHistory),
    ("test-cycle-result-history", models.TestCycleResultHistory),
    ("multi-steps", models.MultiStep),
    ("multi-step-results", models.MultiStepResult),
)


class RelatedRecordsConflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "This record is referenced by other records and cannot be deleted."
    default_code = "related_records"


def viewset_for(model):
    class ModelViewSet(viewsets.ModelViewSet):
        queryset = model.objects.all()
        serializer_class = serializer_for(model)

        def get_queryset(self):
            return super().get_queryset().order_by(model._meta.pk.name)

        def perform_destroy(self, instance):
            try:
                instance.delete()
            except ProtectedError as error:
                raise RelatedRecordsConflict() from error

    ModelViewSet.__name__ = "{}ViewSet".format(model.__name__)
    return ModelViewSet
