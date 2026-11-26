from copy import deepcopy

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Application,
    FixtureDocument,
    FixtureResponse,
    Organization,
    Release,
    Schedule,
    TestCase,
    TestCycle,
    TestSuite,
)


def wrapped(body, code=200):
    return {"statusCode": code, "body": body}


def fixture_response(action):
    item = FixtureResponse.objects.filter(action=action).first()
    return deepcopy(item.payload) if item else None


def application_list():
    return [
        {
            "name": org.name,
            "applications": [
                {"name": app.name, "privileges": app.privileges}
                for app in org.applications.all().order_by("id")
            ],
        }
        for org in Organization.objects.all().order_by("id")
    ]


def case_payload(test_case):
    payload = deepcopy(test_case.payload)
    payload.update(
        {
            "test_case_id": test_case.id,
            "test_case_name": test_case.name,
            "status": test_case.status,
        }
    )
    if test_case.test_type:
        payload["test_type"] = test_case.test_type
    if test_case.suite_id:
        payload.setdefault("test_suite_id", test_case.suite_id)
        payload.setdefault("test_suite_name", test_case.suite.name)
    return payload


def suite_payload(suite):
    payload = deepcopy(suite.payload)
    payload.update(
        {
            "test_suite_id": suite.id,
            "test_suite_name": suite.name,
            "test_suite_desc": suite.description,
            "_modified_by": suite.modified_by,
            "test_cases": [case_payload(case) for case in suite.cases.all().order_by("id")],
        }
    )
    return payload


def cycle_payload(cycle):
    payload = deepcopy(cycle.payload)
    payload.update(
        {
            "test_cycle_id": cycle.id,
            "test_cycle_name": cycle.name,
            "status": cycle.status,
        }
    )
    if cycle.release_id:
        payload["release_id"] = cycle.release_id
    return payload


def release_payload(release):
    payload = deepcopy(release.payload)
    payload.update(
        {
            "release_id": release.id,
            "release_name": release.name,
            "status": release.status,
        }
    )
    if release.start_date:
        payload["start_date"] = release.start_date.isoformat()
    if release.end_date:
        payload["end_date"] = release.end_date.isoformat()
    return payload


def operation_result(action, body):
    if action in ("mdt-get-user-access-info", "get-user-access-info"):
        return wrapped({"organizations": application_list()})

    if action == "get_dashboard_stats":
        document = FixtureDocument.objects.filter(key="dashboard").first()
        return deepcopy(document.payload) if document else None

    if action in ("get-suite-cases", "get-test-suites"):
        suites = list(TestSuite.objects.all().order_by("id"))
        if action == "get-suite-cases":
            search = str(body.get("search_word", "")).casefold()
            filtered = [
                suite for suite in suites
                if not search or search in "{} {} {}".format(suite.id, suite.name, suite.description).casefold()
            ]
            offset = max(int(body.get("offset") or 0), 0)
            limit = max(int(body.get("limit") or len(filtered) or 1), 0)
            return wrapped(
                {
                    "data": [suite_payload(suite) for suite in filtered[offset:offset + limit]],
                    "overll_test_suite_count": len(filtered),
                }
            )
        return wrapped(
            {
                "test_suites": [
                    {
                        "id": suite.id,
                        "name": suite.name,
                        "description": suite.description,
                        **suite_payload(suite),
                    }
                    for suite in suites
                ]
            }
        )

    if action in ("get-test-cases", "list-test-cases"):
        suite_ids = body.get("test_suite_ids") or []
        cases = TestCase.objects.select_related("suite").all().order_by("id")
        if suite_ids:
            cases = cases.filter(suite_id__in=suite_ids)
        return wrapped({"test_cases": [case_payload(case) for case in cases]})

    if action in ("list-releases", "get-release-testcycles"):
        releases = [release_payload(item) for item in Release.objects.all().order_by("id")]
        if action == "list-releases":
            return {"statusCode": 200, "data": {"releases": releases}}
        return {
            "statusCode": 200,
            "data": {
                "releases": releases,
                "test_cycles": [cycle_payload(item) for item in TestCycle.objects.all().order_by("id")],
            },
        }

    if action in ("list-test-cycles", "get-test-cycles"):
        cycles = TestCycle.objects.all().order_by("id")
        release_ids = body.get("release_ids") or []
        if release_ids:
            cycles = cycles.filter(release_id__in=release_ids)
        return wrapped({"test_cycles": [cycle_payload(item) for item in cycles]})

    if action == "list-test-cases":
        return wrapped(
            {"test_cases": [case_payload(item) for item in TestCase.objects.select_related("suite").all().order_by("id")]}
        )

    if action == "get-test-cycle-info":
        cycle = TestCycle.objects.filter(id=body.get("test_cycle_id")).first()
        if cycle:
            return {
                "statusCode": 200,
                "data": {
                    "test_cycle": cycle_payload(cycle),
                    "test_suites": [suite_payload(item) for item in TestSuite.objects.all().order_by("id")],
                },
            }

    if action == "get-executions":
        cycles = []
        for item in TestCycle.objects.all().order_by("id"):
            result = cycle_payload(item)
            total = result.get("total_test_case_count", 0) or 0
            passed = result.get("total_pass_count", 0) or 0
            result.update(
                {
                    "test_cycle_result_id": result.get("test_cycle_result_id", "RUN-{}".format(item.id)),
                    "pass_percentage": round(passed / total * 100) if total else 0,
                }
            )
            cycles.append(result)
        return {"statusCode": 200, "data": {"test_cycle_executions": cycles, "total_count": len(cycles)}}

    if action == "get_schedule_details":
        return wrapped([deepcopy(item.payload) for item in Schedule.objects.all().order_by("id")])

    if action == "guardian-connections":
        document = FixtureDocument.objects.filter(key="connections").first()
        return {"statusCode": 200, "connection_name": deepcopy(document.payload) if document else {}}

    if action == "get-test-case-executions":
        result_id = body.get("test_cycle_result_id")
        cycle = next(
            (
                item for item in TestCycle.objects.all()
                if item.id == result_id or item.payload.get("test_cycle_result_id") == result_id
            ),
            None,
        )
        cases = cycle.payload.get("test_cases", []) if cycle else []
        if not cases:
            cases = [case_payload(item) for item in TestCase.objects.select_related("suite").all()[:3]]
        return {"statusCode": 200, "data": {"test_cases": deepcopy(cases)}}

    if action == "test-suite-create":
        suite_id = "TS-{}".format(2400 + TestSuite.objects.count() + 1)
        suite_name = body.get("test_suite_name") or body.get("testSuiteName") or "New Demo Suite"
        suite = TestSuite.objects.create(
            id=suite_id,
            name=suite_name,
            description=body.get("test_suite_description") or body.get("testSuiteDescription") or "",
            modified_by=body.get("user_id", ""),
        )
        return wrapped("Test suite created: {}.".format(suite.id))

    if action == "test-suite-modify":
        suite = TestSuite.objects.filter(id=body.get("test_suite_id")).first()
        if not suite:
            return fixture_response(action)
        suite.name = body.get("test_suite_name") or suite.name
        suite.description = body.get("test_suite_description") or suite.description
        suite.save()
        return wrapped("Test suite updated.")

    if action == "test-suite-delete":
        TestSuite.objects.filter(id=body.get("test_suite_id")).delete()
        return {"statusCode": 200, "message": "Test suite deleted."}

    if action == "release-create":
        release_id = "REL-DEMO-{}".format(Release.objects.count() + 1)
        release = Release.objects.create(
            id=release_id,
            name=body.get("release_name") or "New Demo Release",
            status="In Progress",
            start_date=body.get("release_date") or None,
            payload={"release_desc": body.get("release_desc", "")},
        )
        return {"statusCode": 200, "message": "Release {} created.".format(release.id)}

    if action == "release-delete":
        release_id = body.get("release_id")
        TestCycle.objects.filter(release_id=release_id).update(release=None)
        Release.objects.filter(id=release_id).delete()
        return {"statusCode": 200, "message": "Release deleted."}

    if action == "test-cycle-create":
        cycle_id = "CY-DEMO-{}".format(TestCycle.objects.count() + 1)
        release = Release.objects.filter(id=(body.get("release_ids") or [None])[0]).first()
        cycle = TestCycle.objects.create(
            id=cycle_id,
            release=release,
            name=body.get("test_cycle_name") or "New Demo Cycle",
            status="Not Executed",
            created_at=timezone.now(),
            payload={
                "test_cycle_result_id": "RUN-{}".format(cycle_id),
                "user_id": body.get("user_id", ""),
                "total_test_case_count": len(body.get("test_cases") or []),
                "total_pass_count": 0,
                "test_cases": deepcopy(body.get("test_cases") or []),
            },
        )
        return {"statusCode": 200, "message": "Test cycle {} created.".format(cycle.id)}

    if action == "test-cycle-delete":
        TestCycle.objects.filter(id=body.get("test_cycle_id")).delete()
        return {"statusCode": 200, "message": "Test cycle deleted."}

    if action == "test-cycle-modify":
        cycle = TestCycle.objects.filter(id=body.get("test_cycle_id")).first()
        if not cycle:
            return fixture_response(action)
        cycle.name = body.get("test_cycle_name") or cycle.name
        cycle.status = body.get("status") or cycle.status
        cycle.save()
        return {"statusCode": 200, "message": "Test cycle updated."}

    if action in ("test-case-create", "mdt-create-iris-testcase", "create-nexus-testcase"):
        response_fixture = fixture_response(action)
        case_id = body.get("test_case_id") or "TC-DEMO-{}".format(TestCase.objects.count() + 1)
        suite = TestSuite.objects.filter(id=body.get("test_suite_id")).first()
        case_name = body.get("test_case_name") or body.get("testCaseName") or "New Demo Test Case"
        TestCase.objects.update_or_create(
            id=case_id,
            defaults={
                "suite": suite,
                "name": case_name,
                "test_type": body.get("test_type", ""),
                "status": "Not Executed",
                "payload": body,
            },
        )
        return response_fixture or wrapped("Test case {} created.".format(case_id))

    if action in ("test-case-modify", "mdt-modify-iris-testcase", "modify-nexus-testcase"):
        case = TestCase.objects.filter(id=body.get("test_case_id")).first()
        if not case:
            return fixture_response(action)
        case.name = body.get("test_case_name") or case.name
        case.status = body.get("status") or case.status
        case.payload.update(body)
        case.save()
        return fixture_response(action) or wrapped("Test case updated.")

    if action == "test-case-delete":
        TestCase.objects.filter(id=body.get("test_case_id")).delete()
        return {"statusCode": 200, "message": "Test case deleted."}

    if action == "mdt-change-status":
        result_id = (
            body.get("test_case_result_id")
            or body.get("tc_result_id")
            or body.get("test_cycle_result_id")
            or body.get("test_case_id")
        )
        for cycle in TestCycle.objects.all():
            if cycle.id == result_id or cycle.payload.get("test_cycle_result_id") == result_id:
                cycle.status = body.get("status") or cycle.status
                cycle.payload["status"] = cycle.status
                cycle.save(update_fields=["status", "payload"])
            cases = cycle.payload.get("test_cases", [])
            changed = False
            for case in cases:
                if case.get("test_case_result_id") == result_id or case.get("test_case_id") == result_id:
                    case["status"] = body.get("status") or case.get("status")
                    changed = True
            if changed:
                cycle.payload["test_cases"] = cases
                cycle.save(update_fields=["payload"])
        case = TestCase.objects.filter(id=result_id).first()
        if case:
            case.status = body.get("status") or case.status
            case.save(update_fields=["status"])
        return {"statusCode": 200, "message": "Status updated."}

    if action == "mdt-stop-execution":
        cycle_id = body.get("test_cycle_id") or body.get("test_cycle_result_id")
        cycle = next(
            (
                item for item in TestCycle.objects.all()
                if item.id == cycle_id or item.payload.get("test_cycle_result_id") == cycle_id
            ),
            None,
        )
        if cycle:
            cycle.status = "Force Stop"
            cycle.payload["status"] = cycle.status
            cycle.save(update_fields=["status", "payload"])
        return {"statusCode": 200, "message": "Execution stopped."}

    if action == "execute":
        cases = body.get("test_cases") or []
        return wrapped({"message": "{} test case(s) queued.".format(len(cases) or 1)})

    if action == "scheduler":
        return wrapped("Schedule action accepted.")

    if action == "get-nexus-test-cases":
        return wrapped({"data": []})
    if action == "get-nexus-domains":
        return wrapped([])
    if action == "get-nexus-cycle-executions":
        return {"statusCode": 200, "data": {"test_cycle_executions": []}}

    saved_response = fixture_response(action)
    if saved_response is not None:
        return saved_response
    return None


class OperationView(APIView):
    def get(self, request, resource=""):
        return self.handle(request, resource)

    def post(self, request, resource=""):
        return self.handle(request, resource)

    def put(self, request, resource=""):
        return self.handle(request, resource)

    def patch(self, request, resource=""):
        return self.handle(request, resource)

    def delete(self, request, resource=""):
        return self.handle(request, resource)

    @transaction.atomic
    def handle(self, request, resource):
        body = request.data if isinstance(request.data, dict) else {}
        action = body.get("function_name") or request.query_params.get("function_name")
        if not action and resource in ("operations", ""):
            return Response(
                {"statusCode": 400, "message": "function_name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        action = action or resource.strip("/").rsplit("/", 1)[-1]
        result = operation_result(action, body)
        if result is None:
            return Response(
                {"statusCode": 404, "message": "Unknown API action: {}.".format(action)},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(result)
