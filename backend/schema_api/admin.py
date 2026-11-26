from django.contrib import admin
from django.db import models

from .views import MODEL_ROUTES


class SchemaModelAdmin(admin.ModelAdmin):
    list_per_page = 50

    def get_list_display(self, request):
        visible_fields = [
            field
            for field in self.model._meta.concrete_fields
            if field.name not in {"refresh_token", "password_hash"}
        ]
        return tuple(field.name for field in visible_fields[:5])

    def get_search_fields(self, request):
        return tuple(
            field.name
            for field in self.model._meta.concrete_fields
            if isinstance(field, (models.CharField, models.TextField))
            and field.name not in {"refresh_token", "password_hash"}
        )

    def get_list_filter(self, request):
        return tuple(
            field.name
            for field in self.model._meta.concrete_fields
            if isinstance(field, models.BooleanField)
        )


for _, model in MODEL_ROUTES:
    admin.site.register(model, SchemaModelAdmin)
