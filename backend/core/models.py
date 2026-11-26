import uuid

from django.db import models


class Organization(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name


class Application(models.Model):
    organization = models.ForeignKey(Organization, related_name="applications", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    privileges = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["organization", "name"], name="unique_application_per_organization")
        ]


class ConnectionType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Connection(models.Model):
    connection_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=200)
    connection_type = models.ForeignKey(
        ConnectionType, related_name="connections", on_delete=models.PROTECT
    )
    app_name = models.CharField(max_length=200, default="Falcon_Dev")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["connection_type__name", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["connection_type", "name", "app_name"],
                name="unique_connection_name_per_app_and_type",
            )
        ]

    def __str__(self):
        return "{} ({})".format(self.name, self.connection_type.name)


class TestSuite(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    modified_by = models.CharField(max_length=200, blank=True)
    payload = models.JSONField(default=dict)


class TestCase(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    suite = models.ForeignKey(TestSuite, related_name="cases", on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=300)
    test_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=100, default="Not Executed")
    payload = models.JSONField(default=dict)


class Release(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=300)
    status = models.CharField(max_length=100, default="In Progress")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    payload = models.JSONField(default=dict)


class TestCycle(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    release = models.ForeignKey(Release, related_name="cycles", on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=300)
    status = models.CharField(max_length=100, default="Not Executed")
    created_at = models.DateTimeField(null=True, blank=True)
    payload = models.JSONField(default=dict)


class Schedule(models.Model):
    id = models.CharField(max_length=200, primary_key=True)
    cycle = models.ForeignKey(TestCycle, related_name="schedules", on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=300, blank=True)
    enabled = models.BooleanField(default=False)
    payload = models.JSONField(default=dict)


class FixtureResponse(models.Model):
    action = models.CharField(max_length=200, primary_key=True)
    payload = models.JSONField(default=dict)


class FixtureDocument(models.Model):
    key = models.CharField(max_length=200, primary_key=True)
    payload = models.JSONField(default=dict)
