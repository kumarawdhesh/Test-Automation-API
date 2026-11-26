from django.contrib import admin

from .models import Connection, ConnectionType


@admin.register(ConnectionType)
class ConnectionTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name", "description")
    ordering = ("name",)


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ("name", "connection_type", "app_name", "connection_id", "is_active")
    list_filter = ("connection_type", "app_name", "is_active")
    search_fields = ("name", "connection_id", "app_name", "connection_type__name")
    readonly_fields = ("connection_id",)
    ordering = ("connection_type__name", "name")
