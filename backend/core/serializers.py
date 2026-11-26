from rest_framework import serializers

from .models import Release, TestCase, TestCycle, TestSuite


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ["id", "suite", "name", "test_type", "status", "payload"]


class TestSuiteSerializer(serializers.ModelSerializer):
    cases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = TestSuite
        fields = ["id", "name", "description", "modified_by", "payload", "cases"]


class ReleaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Release
        fields = ["id", "name", "status", "start_date", "end_date", "payload"]


class TestCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCycle
        fields = ["id", "release", "name", "status", "created_at", "payload"]
