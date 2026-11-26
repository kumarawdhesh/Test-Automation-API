import json
from datetime import date, datetime
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from core.models import (
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


def as_date(value):
    if not value or value == "None":
        return None
    try:
        return date.fromisoformat(value[:10])
    except (TypeError, ValueError):
        return None


def as_datetime(value):
    if not value or value == "None":
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


class Command(BaseCommand):
    help = "Load or refresh the default database records from the UI demo-data.json fixture."

    def add_arguments(self, parser):
        parser.add_argument("--fixture", help="Path to demo-data.json")

    def handle(self, *args, **options):
        fixture_path = Path(options["fixture"]) if options["fixture"] else (
            Path(__file__).resolve().parents[4] / "src" / "assets" / "json" / "demo-data.json"
        )
        if not fixture_path.is_file():
            raise CommandError("Demo fixture not found at {}. Pass --fixture with its path.".format(fixture_path))
        with fixture_path.open(encoding="utf-8") as fixture_file:
            data = json.load(fixture_file)

        for organization_data in data.get("access", {}).get("body", {}).get("organizations", []):
            organization, _ = Organization.objects.update_or_create(
                name=organization_data["name"], defaults={}
            )
            for application_data in organization_data.get("applications", []):
                Application.objects.update_or_create(
                    organization=organization,
                    name=application_data["name"],
                    defaults={"privileges": application_data.get("privileges", "")},
                )

        for release_data in data.get("releases", []):
            Release.objects.update_or_create(
                id=release_data["release_id"],
                defaults={
                    "name": release_data.get("release_name", ""),
                    "status": release_data.get("status", "In Progress"),
                    "start_date": as_date(release_data.get("start_date")),
                    "end_date": as_date(release_data.get("end_date")),
                    "payload": release_data,
                },
            )

        for suite_data in data.get("testSuites", []):
            suite, _ = TestSuite.objects.update_or_create(
                id=suite_data["test_suite_id"],
                defaults={
                    "name": suite_data.get("test_suite_name", ""),
                    "description": suite_data.get("test_suite_desc", ""),
                    "modified_by": suite_data.get("_modified_by", ""),
                    "payload": {key: value for key, value in suite_data.items() if key != "test_cases"},
                },
            )
            for case_data in suite_data.get("test_cases", []):
                TestCase.objects.update_or_create(
                    id=case_data["test_case_id"],
                    defaults={
                        "suite": suite,
                        "name": case_data.get("test_case_name", ""),
                        "test_type": case_data.get("test_type", ""),
                        "status": case_data.get("status", "Not Executed"),
                        "payload": case_data,
                    },
                )

        for cycle_data in data.get("testCycles", []):
            release = Release.objects.filter(id=cycle_data.get("release_id")).first()
            TestCycle.objects.update_or_create(
                id=cycle_data["test_cycle_id"],
                defaults={
                    "release": release,
                    "name": cycle_data.get("test_cycle_name", ""),
                    "status": cycle_data.get("status", "Not Executed"),
                    "created_at": as_datetime(cycle_data.get("time_stamp")),
                    "payload": cycle_data,
                },
            )

        for index, schedule_data in enumerate(data.get("schedules", [])):
            cycle = TestCycle.objects.filter(id=schedule_data.get("test_cycle_id")).first()
            schedule_id = "{}:{}".format(schedule_data.get("test_cycle_id", "schedule"), index)
            Schedule.objects.update_or_create(
                id=schedule_id,
                defaults={
                    "cycle": cycle,
                    "name": schedule_data.get("schedule_name", ""),
                    "enabled": schedule_data.get("enabled", False),
                    "payload": schedule_data,
                },
            )

        for action, payload in data.get("apiResponses", {}).items():
            FixtureResponse.objects.update_or_create(action=action, defaults={"payload": payload})
        for key in ("dashboard", "connections", "schemas", "columns", "scenarios", "reportExamples"):
            if key in data:
                FixtureDocument.objects.update_or_create(key=key, defaults={"payload": data[key]})

        self.stdout.write(
            self.style.SUCCESS(
                "Loaded demo data: {} suites, {} cases, {} releases, {} cycles, {} fixture responses.".format(
                    TestSuite.objects.count(),
                    TestCase.objects.count(),
                    Release.objects.count(),
                    TestCycle.objects.count(),
                    FixtureResponse.objects.count(),
                )
            )
        )
