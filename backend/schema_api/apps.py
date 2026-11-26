from django.apps import AppConfig


class SchemaApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "schema_api"
    verbose_name = "UniStore data model API"
