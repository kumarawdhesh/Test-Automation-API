from django.contrib import admin
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .views import MODEL_ROUTES


class SchemaApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_api_root_lists_every_ddl_resource(self):
        response = self.client.get("/api/v1/")
        self.assertEqual(response.status_code, 200)
        for route, _ in MODEL_ROUTES:
            with self.subTest(route=route):
                self.assertIn(route, response.json())

    def test_schema_relationships_and_protected_delete(self):
        object_response = self.client.post(
            "/api/v1/test-objects/",
            {
                "test_object_type": "TABLE",
                "test_object_name": "ORDERS",
                "test_object_description": "Demo source table",
            },
            format="json",
        )
        self.assertEqual(object_response.status_code, 201)
        object_id = object_response.json()["test_object_id"]

        suite_response = self.client.post(
            "/api/v1/test-suites/",
            {"test_suite_name": "API suite", "domain_name": "Finance"},
            format="json",
        )
        self.assertEqual(suite_response.status_code, 201)

        user_response = self.client.post(
            "/api/v1/app-users/",
            {
                "user_role": "Admin",
                "user_access": "ReadWrite",
                "user_name": "API User",
                "email": "api-user@example.test",
                "slack_preference": "false",
                "email_preference": "true",
                "refresh_token": "do-not-return-this",
            },
            format="json",
        )
        self.assertEqual(user_response.status_code, 201)
        user_id = user_response.json()["app_user_id"]
        self.assertNotIn("refresh_token", user_response.json())

        config_response = self.client.post(
            "/api/v1/test-case-configs/",
            {
                "test_case_type": "Data_Testing",
                "source_object": object_id,
                "tgt_object": object_id,
                "source_conn_name": "Source demo",
                "tgt_conn_name": "Target demo",
            },
            format="json",
        )
        self.assertEqual(config_response.status_code, 201)

        case_response = self.client.post(
            "/api/v1/test-cases/",
            {
                "test_case_name": "Compare order counts",
                "test_suite": suite_response.json()["test_suite_id"],
                "tc_config": config_response.json()["tc_config_id"],
                "dev_app_user": user_id,
            },
            format="json",
        )
        self.assertEqual(case_response.status_code, 201)
        self.assertEqual(case_response.json()["test_case_name"], "Compare order counts")

        delete_response = self.client.delete("/api/v1/test-objects/{}/".format(object_id))
        self.assertEqual(delete_response.status_code, 409)

    def test_all_ddl_models_are_available_in_admin(self):
        user = get_user_model().objects.create_superuser(
            username="schema-admin",
            email="schema-admin@example.test",
            password="test-password",
        )
        self.client.force_login(user)

        for _, model in MODEL_ROUTES:
            with self.subTest(model=model.__name__):
                self.assertIn(model, admin.site._registry)
                response = self.client.get(
                    "/admin/{}/{}/add/".format(model._meta.app_label, model._meta.model_name)
                )
                self.assertEqual(response.status_code, 200)
