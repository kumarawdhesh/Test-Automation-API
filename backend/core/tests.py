import json
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Release, TestCase as TestCaseModel, TestCycle, TestSuite


PROJECT_ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = PROJECT_ROOT / "src" / "assets" / "json" / "demo-data.json"


class DemoOperationsApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", fixture=str(FIXTURE_PATH), verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def post_action(self, action, **payload):
        return self.client.post(
            "/api/operations/",
            {"function_name": action, **payload},
            format="json",
        )

    def test_health_and_unknown_operation(self):
        self.assertEqual(self.client.get("/api/health/").status_code, 200)
        response = self.post_action("not-a-real-action")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["statusCode"], 404)

    def test_all_fixture_api_actions_have_json_responses(self):
        with FIXTURE_PATH.open(encoding="utf-8") as fixture_file:
            fixture = json.load(fixture_file)
        actions = sorted(fixture["apiResponses"])
        failures = []
        for action in actions:
            response = self.post_action(action)
            if response.status_code != 200 or not isinstance(response.json(), dict):
                failures.append("{}: {}".format(action, response.status_code))
        self.assertEqual(failures, [])

    def test_core_read_endpoints_match_ui_response_envelopes(self):
        cases = {
            "list-releases": ("data", "releases"),
            "list-test-cycles": ("body", "test_cycles"),
            "list-test-cases": ("body", "test_cases"),
            "get-suite-cases": ("body", "data"),
            "get-release-testcycles": ("data", "test_cycles"),
            "get-executions": ("data", "test_cycle_executions"),
        }
        for action, (envelope, key) in cases.items():
            with self.subTest(action=action):
                response = self.post_action(action)
                self.assertEqual(response.status_code, 200)
                self.assertIn(key, response.json()[envelope])
                self.assertTrue(response.json()[envelope][key])

    def test_seeded_connection_types_and_case_details(self):
        connections = self.client.get(
            "/api/guardian-connections/?operation=fetch_connection_names&appName=Falcon_Dev"
        ).json()["connection_name"]
        self.assertIn("MySQL", connections)
        self.assertIn("SQL Server", connections)
        self.assertTrue(connections["PostgreSQL"][0]["connectionId"])

        suite = self.post_action("get-suite-cases").json()["body"]["data"][0]
        case = suite["test_cases"][0]
        self.assertEqual(case["test_config"]["source_connection"]["type"], "PostgreSQL")
        self.assertEqual(case["test_config"]["source_connection"]["name"], "Orders Demo DB")
        self.assertEqual(case["test_config"]["target_connection"]["type"], "Snowflake")
        self.assertEqual(case["test_config"]["target_connection"]["name"], "Analytics Demo Warehouse")

    def test_data_testing_metadata_and_sql_generation(self):
        schemas = self.post_action("mdt-get-all-schema-tables").json()["body"]
        self.assertTrue(schemas[0]["tables"])

        metadata = self.post_action(
            "mdt-get-schema-tables-columns-details",
            source_details=[{"schema": "PUBLIC", "table": "ORDERS"}],
            target_details=[{"schema": "PUBLIC", "table": "ORDERS"}],
        ).json()["body"]
        self.assertIn("ORDER_TOTAL", metadata["columns"]["source_tables"]["ORDERS"])
        self.assertTrue(metadata["data_test_scenarios"]["data_test_scenarios"])

        generated = self.post_action(
            "mdt-data-testing-sql-generation",
            source_details=[{"schema": "PUBLIC", "table": "ORDERS"}],
            target_details=[{"schema": "PUBLIC", "table": "ORDERS"}],
            test_scenarios=["Row count matches"],
        ).json()["body"]["sql_queries"]
        self.assertEqual(len(generated), 1)
        self.assertIn("PUBLIC.ORDERS", generated[0]["source_sql"])
        self.assertIn("PUBLIC.ORDERS", generated[0]["target_sql"])

    def test_ui_legacy_resource_urls(self):
        requests = [
            ("/api/test-release", "list-releases"),
            ("/api/test-cycle", "list-test-cycles"),
            ("/api/test-case", "list-test-cases"),
            ("/api/test-suite", "get-suite-cases"),
            ("/api/dashboard-operations", "get_dashboard_stats"),
            ("/api/execute-operations", "execute"),
            ("/api/scheduler-operations", "scheduler"),
        ]
        for path, action in requests:
            with self.subTest(path=path):
                response = self.client.post(
                    path,
                    {"function_name": action},
                    format="json",
                    HTTP_ORIGIN="http://localhost:1234",
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response["Access-Control-Allow-Origin"], "*")

    def test_ui_text_plain_json_requests_are_accepted(self):
        response = self.client.post(
            "/api/test-case",
            data=json.dumps({"function_name": "list-test-cases"}),
            content_type="text/plain",
            HTTP_ORIGIN="http://localhost:1234",
        )
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()["body"]["test_cases"]), 0)

    def test_guardian_connection_lookup(self):
        response = self.client.get(
            "/api/guardian-connections/?operation=fetch_connection_names&appName=Falcon_Dev"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("PostgreSQL", response.json()["connection_name"])

    def test_suite_create_update_and_delete(self):
        self.assertEqual(self.post_action("test-suite-create", test_suite_name="API suite").status_code, 200)
        suite = TestSuite.objects.get(name="API suite")
        self.assertEqual(
            self.post_action("test-suite-modify", test_suite_id=suite.id, test_suite_name="Updated suite").status_code,
            200,
        )
        suite.refresh_from_db()
        self.assertEqual(suite.name, "Updated suite")
        self.assertEqual(self.post_action("test-suite-delete", test_suite_id=suite.id).status_code, 200)
        self.assertFalse(TestSuite.objects.filter(id=suite.id).exists())

    def test_release_and_cycle_create_then_delete(self):
        self.assertEqual(self.post_action("release-create", release_name="API release").status_code, 200)
        release = Release.objects.get(name="API release")
        self.assertEqual(
            self.post_action(
                "test-cycle-create",
                test_cycle_name="API cycle",
                release_ids=[release.id],
                test_cases=[],
            ).status_code,
            200,
        )
        cycle = TestCycle.objects.get(name="API cycle")
        self.assertEqual(cycle.release_id, release.id)
        self.assertEqual(self.post_action("test-cycle-delete", test_cycle_id=cycle.id).status_code, 200)
        self.assertEqual(self.post_action("release-delete", release_id=release.id).status_code, 200)
        self.assertFalse(TestCycle.objects.filter(id=cycle.id).exists())
        self.assertFalse(Release.objects.filter(id=release.id).exists())

    def test_case_create_status_change_and_delete(self):
        suite = TestSuite.objects.first()
        self.assertEqual(
            self.post_action(
                "test-case-create",
                test_case_id="TC-API-1",
                test_case_name="Created via API",
                test_suite_id=suite.id,
            ).status_code,
            200,
        )
        test_case = TestCaseModel.objects.get(id="TC-API-1")
        self.assertEqual(test_case.suite_id, suite.id)
        self.assertEqual(self.post_action("mdt-change-status", test_case_id=test_case.id, status="Pass").status_code, 200)
        test_case.refresh_from_db()
        self.assertEqual(test_case.status, "Pass")
        self.assertEqual(self.post_action("test-case-delete", test_case_id=test_case.id).status_code, 200)
        self.assertFalse(TestCaseModel.objects.filter(id=test_case.id).exists())

    def test_ui_data_case_create_read_and_delete_round_trip(self):
        response = self.post_action(
            "test-case-create",
            user_id="local.explorer@ilink.demo",
            test_cases=[
                {
                    "testSuiteId": {
                        "test_suite_name": "Created from UI",
                        "test_suite_description": "End-to-end demo suite",
                    },
                    "testCaseName": "UI-created connection comparison",
                    "testCaseDescription": "Compares source and target row counts.",
                    "testType": "Data_Testing",
                    "sourceConnection": "PostgreSQL",
                    "sourceDB": "Orders Demo DB",
                    "targetConnection": "Snowflake",
                    "targetDB": "Analytics Demo Warehouse",
                    "sourceSQL": "SELECT COUNT(*) FROM PUBLIC.ORDERS",
                    "targetSQL": "SELECT COUNT(*) FROM PUBLIC.ORDERS",
                    "keyColumns": ["ORDER_ID"],
                    "testScenario": "Row count matches",
                },
                {
                    "testSuiteId": {"test_suite_name": "Created from UI"},
                    "testCaseName": "UI-created required fields check",
                    "testType": "Data_Testing",
                    "sourceConnection": "MySQL",
                    "sourceDB": "Commerce MySQL Demo DB",
                    "targetConnection": "SQL Server",
                    "targetDB": "ERP SQL Server Demo DB",
                    "sourceSQL": "SELECT COUNT(*) FROM PUBLIC.ORDERS",
                    "targetSQL": "SELECT COUNT(*) FROM PUBLIC.ORDERS",
                    "keyColumns": ["ORDER_ID"],
                    "testScenario": "Required fields are populated",
                },
            ],
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["total_successfully_created_testcases"], 2)
        self.assertEqual(response.json()["total_failed_testcases"], [])

        created_id = response.json()["created_test_cases"][0]["test_case_id"]
        suite = self.post_action("get-suite-cases", search_word="Created from UI").json()["body"]["data"][0]
        cases = suite["test_cases"]
        case = next(item for item in cases if item["test_case_id"] == created_id)
        self.assertEqual(len(cases), 2)
        self.assertEqual(case["test_config"]["test_case_type"], "Data_Testing")
        self.assertEqual(case["test_config"]["source_connection"]["type"], "PostgreSQL")
        self.assertEqual(case["test_config"]["source_connection"]["connection_id"], "demo-pg-orders")
        self.assertEqual(case["test_config"]["target_connection"]["type"], "Snowflake")
        self.assertEqual(
            case["test_config"]["target_connection"]["connection_id"],
            "demo-snowflake-analytics",
        )
        self.assertEqual(case["test_config"]["queries"]["source_sql"], "SELECT COUNT(*) FROM PUBLIC.ORDERS")
        self.assertEqual(case["test_config"]["key_cols_override"], ["ORDER_ID"])
        other_case = next(item for item in cases if item["test_case_id"] != created_id)
        self.assertEqual(other_case["test_config"]["source_connection"]["type"], "MySQL")
        self.assertEqual(other_case["test_config"]["target_connection"]["type"], "SQL Server")

        for item in cases:
            delete = self.post_action("test-case-delete", test_case_id=item["test_case_id"])
            self.assertEqual(delete.status_code, 200)
        self.assertEqual(
            self.post_action("get-suite-cases", search_word="Created from UI").json()["body"]["data"][0]["test_cases"],
            [],
        )
