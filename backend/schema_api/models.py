from django.db import models
from django.utils import timezone


class RequiredAuditFields(models.Model):
    created_by = models.TextField(db_column="_created_by", default="system")
    created_at = models.DateTimeField(db_column="_created_ts", auto_now_add=True)
    modified_by = models.TextField(db_column="_modified_by", default="system")
    modified_at = models.DateTimeField(db_column="_modified_ts", auto_now=True)

    class Meta:
        abstract = True


class TimestampAuditFields(models.Model):
    created_at = models.DateTimeField(db_column="_created_ts", auto_now_add=True)
    modified_at = models.DateTimeField(db_column="_modified_ts", auto_now=True)

    class Meta:
        abstract = True


class AppUser(RequiredAuditFields):
    app_user_id = models.AutoField(primary_key=True)
    user_role = models.TextField()
    user_access = models.TextField()
    user_name = models.TextField()
    email = models.EmailField(unique=True)
    slack_preference = models.TextField()
    email_preference = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    redirect_uri = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_APP_USERS"
        ordering = ["app_user_id"]

    def __str__(self):
        return self.email


class BucketName(models.Model):
    bucket_id = models.AutoField(primary_key=True)
    bucket_name = models.TextField()

    class Meta:
        db_table = "T_BUCKET_NAME"
        ordering = ["bucket_id"]

    def __str__(self):
        return self.bucket_name


class Environment(models.Model):
    env_id = models.AutoField(primary_key=True)
    env_name = models.TextField()

    class Meta:
        db_table = "T_ENVIRONMENTS"
        ordering = ["env_id"]

    def __str__(self):
        return self.env_name


class IrisResponse(RequiredAuditFields):
    tc_result_id = models.TextField(primary_key=True)
    modified_by = models.TextField(db_column="_modified_by", blank=True, null=True)
    modified_at = models.DateTimeField(db_column="_modified_ts", blank=True, null=True)
    chat_id = models.TextField(default="falcon-test-execution-request")
    user_id = models.TextField(default="svc_falcon_admin@ea.com")
    question = models.TextField(blank=True, null=True)
    question_timestamp = models.DateTimeField(db_column="ques_time_stamp", blank=True, null=True)
    insight_object = models.JSONField(blank=True, null=True)
    cost = models.TextField(blank=True, null=True)
    tokens = models.TextField(blank=True, null=True)
    data_domain = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_IRIS_RESPONSE"
        ordering = ["tc_result_id"]

    def __str__(self):
        return self.tc_result_id


class TestObject(models.Model):
    test_object_id = models.AutoField(primary_key=True)
    test_object_type = models.TextField()
    test_object_name = models.TextField()
    test_object_description = models.TextField()

    class Meta:
        db_table = "T_TEST_OBJECT"
        ordering = ["test_object_id"]

    def __str__(self):
        return self.test_object_name


class TestObjectConfig(models.Model):
    test_object_config_id = models.AutoField(primary_key=True)
    attribute_name = models.TextField()
    attribute_value = models.TextField(blank=True, null=True)
    test_object = models.ForeignKey(
        TestObject,
        db_column="test_object_id",
        related_name="configurations",
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = "T_TEST_OBJECT_CONFIG"
        ordering = ["test_object_config_id"]

    def __str__(self):
        return "{}: {}".format(self.test_object.test_object_name, self.attribute_name)


class TestCaseConfig(models.Model):
    tc_config_id = models.AutoField(primary_key=True)
    test_case_type = models.TextField()
    test_scenario = models.TextField(blank=True, null=True)
    key_cols_override = models.TextField(blank=True, null=True)
    source_object = models.ForeignKey(
        TestObject,
        db_column="source_object",
        related_name="source_test_configs",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
    )
    tgt_object = models.ForeignKey(
        TestObject,
        db_column="tgt_object",
        related_name="target_test_configs",
        on_delete=models.PROTECT,
    )
    source_conn_name = models.TextField(blank=True, null=True)
    tgt_conn_name = models.TextField(blank=True, null=True)
    tgt_conn_type = models.TextField(blank=True, null=True)
    is_multi_step_enabled = models.BooleanField(default=False)
    source_conn_type = models.TextField(blank=True, null=True)
    multi_step_type = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CASE_CONFIG"
        ordering = ["tc_config_id"]

    def __str__(self):
        return "{} ({})".format(self.test_case_type, self.tc_config_id)


class TestSuite(RequiredAuditFields):
    test_suite_id = models.AutoField(primary_key=True)
    test_suite_name = models.TextField()
    test_suite_desc = models.TextField(blank=True, null=True)
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_SUITE"
        ordering = ["test_suite_id"]

    def __str__(self):
        return self.test_suite_name


class TestCase(RequiredAuditFields):
    test_case_id = models.AutoField(primary_key=True)
    test_case_name = models.TextField()
    test_case_desc = models.TextField(blank=True, null=True)
    test_suite = models.ForeignKey(
        TestSuite,
        db_column="test_suite_id",
        related_name="test_cases",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
    )
    tc_config = models.ForeignKey(
        TestCaseConfig,
        db_column="tc_config_id",
        related_name="test_cases",
        on_delete=models.PROTECT,
    )
    dev_app_user = models.ForeignKey(
        AppUser,
        db_column="dev_app_user_id",
        related_name="test_cases",
        on_delete=models.PROTECT,
    )
    modify_reason = models.TextField(blank=True, null=True)
    test_case_input = models.TextField(blank=True, null=True)
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CASE"
        ordering = ["test_case_id"]

    def __str__(self):
        return self.test_case_name


class TestCycle(RequiredAuditFields):
    test_cycle_id = models.AutoField(primary_key=True)
    test_cycle_name = models.TextField()
    test_cycle_desc = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False, db_column="isDeleted")
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CYCLE"
        ordering = ["test_cycle_id"]

    def __str__(self):
        return self.test_cycle_name


class Release(RequiredAuditFields):
    release_id = models.AutoField(primary_key=True)
    release_name = models.TextField()
    release_desc = models.TextField(blank=True, null=True)
    release_date = models.DateField()
    execution_status = models.TextField(default="Not Executed")
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_RELEASE"
        ordering = ["release_id"]

    def __str__(self):
        return self.release_name


class ReleaseTestCycleMapping(RequiredAuditFields):
    release_test_cycle_mapping_id = models.AutoField(primary_key=True)
    release = models.ForeignKey(
        Release,
        db_column="release_id",
        related_name="cycle_mappings",
        on_delete=models.PROTECT,
    )
    test_cycle = models.ForeignKey(
        TestCycle,
        db_column="test_cycle_id",
        related_name="release_mappings",
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = "T_RELEASE_TEST_CYCLE_MAPPING"
        ordering = ["release_id", "test_cycle_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["release", "test_cycle"],
                name="unique_release_test_cycle_mapping",
            )
        ]


class TestCycleCaseMapping(RequiredAuditFields):
    test_cycle_case_mapping_id = models.AutoField(primary_key=True)
    test_cycle = models.ForeignKey(
        TestCycle,
        db_column="test_cycle_id",
        related_name="case_mappings",
        on_delete=models.PROTECT,
    )
    test_case = models.ForeignKey(
        TestCase,
        db_column="test_case_id",
        related_name="cycle_mappings",
        on_delete=models.PROTECT,
    )
    depends_on = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CYCLE_CASE_MAPPING"
        ordering = ["test_cycle_id", "test_case_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["test_cycle", "test_case"],
                name="unique_test_cycle_case_mapping",
            )
        ]


class Scheduler(RequiredAuditFields):
    schedule_id = models.AutoField(primary_key=True)
    schedule_name = models.TextField(db_column="schdule_name")
    schedule_details = models.TextField(db_column="schedule_dtls", blank=True, null=True)
    schedule_state = models.TextField()
    schedule_cron_expr = models.TextField()
    test_cycle = models.ForeignKey(
        TestCycle,
        db_column="test_cycle_id",
        related_name="schedules",
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = "T_SCHEDULER"
        ordering = ["schedule_id"]

    def __str__(self):
        return self.schedule_name


class TestDataGenAudit(RequiredAuditFields):
    test_data_gen_id = models.AutoField(primary_key=True)
    test_suite_id = models.IntegerField(blank=True, null=True)
    test_case = models.ForeignKey(
        TestCase,
        db_column="test_case_id",
        related_name="data_generation_audits",
        on_delete=models.PROTECT,
    )
    object_name = models.TextField()
    number_of_recs = models.IntegerField()
    start_at = models.DateTimeField(db_column="start_ts")
    end_at = models.DateTimeField(db_column="end_ts")
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_DATA_GEN_AUDIT"
        ordering = ["test_data_gen_id"]


class TestCycleResult(RequiredAuditFields):
    test_cycle_result_id = models.AutoField(primary_key=True)
    test_cycle = models.ForeignKey(
        TestCycle,
        db_column="test_cycle_id",
        related_name="results",
        on_delete=models.PROTECT,
    )
    execution_status = models.TextField()
    execution_message = models.TextField(blank=True, null=True)
    test_cycle_result = models.TextField()
    start_at = models.DateTimeField(db_column="start_ts", default=timezone.now)
    end_at = models.DateTimeField(db_column="end_ts", blank=True, null=True)
    execution_log_url = models.TextField(blank=True, null=True)
    test_cycle_name = models.TextField(blank=True, null=True)
    test_cycle_report_url = models.TextField(blank=True, null=True)
    total_pass_count = models.IntegerField(blank=True, null=True)
    total_test_case_count = models.IntegerField(blank=True, null=True)
    tc_report_type = models.TextField()
    password_hash = models.BinaryField(blank=True, null=True)
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)
    origin = models.TextField(blank=True, null=True)
    issue_created = models.BooleanField(default=False)

    class Meta:
        db_table = "T_TEST_CYCLE_RESULTS"
        ordering = ["test_cycle_result_id"]

    def __str__(self):
        return str(self.test_cycle_result_id)


class TestCaseResult(RequiredAuditFields):
    tc_result_id = models.AutoField(primary_key=True)
    test_cycle_id = models.IntegerField()
    test_case = models.ForeignKey(
        TestCase,
        db_column="test_case_id",
        related_name="results",
        on_delete=models.PROTECT,
    )
    test_cycle_result = models.ForeignKey(
        TestCycleResult,
        db_column="test_cycle_result_id",
        related_name="case_results",
        on_delete=models.PROTECT,
    )
    execution_status = models.TextField()
    execution_message = models.TextField(blank=True, null=True)
    tc_result_status = models.TextField(blank=True, null=True)
    tc_start_at = models.DateTimeField(db_column="tc_start_ts", default=timezone.now)
    tc_end_at = models.DateTimeField(db_column="tc_end_ts", blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    test_report = models.TextField(blank=True, null=True)
    test_report_url = models.TextField(blank=True, null=True)
    execution_log_url = models.TextField(blank=True, null=True)
    modification_cause = models.TextField(blank=True, null=True)
    test_case_name = models.TextField(blank=True, null=True)
    source_connection_name = models.TextField(blank=True, null=True)
    source_connection_type = models.TextField(blank=True, null=True)
    target_connection_name = models.TextField(blank=True, null=True)
    target_connection_type = models.TextField(blank=True, null=True)
    source_query = models.TextField(blank=True, null=True)
    target_query = models.TextField(blank=True, null=True)
    test_suite_name = models.TextField(blank=True, null=True)
    test_suite_id = models.IntegerField(blank=True, null=True)
    password_hash = models.BinaryField(blank=True, null=True)
    tc_report_type = models.TextField()
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)
    source_conn_name = models.TextField(blank=True, null=True)
    tgt_conn_name = models.TextField(blank=True, null=True)
    source_conn_type = models.TextField(blank=True, null=True)
    tgt_conn_type = models.TextField(blank=True, null=True)
    depends_on = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CASE_RESULTS"
        ordering = ["tc_result_id"]

    def __str__(self):
        return str(self.tc_result_id)


class TestCaseResultHistory(TimestampAuditFields):
    tc_result_hist_id = models.AutoField(primary_key=True)
    created_by = models.TextField(db_column="_created_by", default="system")
    modified_by = models.TextField(db_column="_modified_by", default="system")
    test_cycle_id = models.IntegerField()
    test_case_id = models.IntegerField()
    test_cycle_result_id = models.IntegerField()
    tc_result = models.ForeignKey(
        TestCaseResult,
        db_column="tc_result_id",
        related_name="history",
        on_delete=models.PROTECT,
    )
    execution_status = models.TextField()
    execution_message = models.TextField(blank=True, null=True)
    tc_result_status = models.TextField()
    tc_start_at = models.DateTimeField(db_column="tc_start_ts", default=timezone.now)
    tc_end_at = models.DateTimeField(db_column="tc_end_ts", blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    test_report = models.TextField(blank=True, null=True)
    test_report_url = models.TextField(blank=True, null=True)
    execution_log_url = models.TextField(blank=True, null=True)
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)
    target_connection_type = models.TextField(blank=True, null=True)
    target_connection_name = models.TextField(blank=True, null=True)
    source_connection_type = models.TextField(blank=True, null=True)
    source_connection_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CASE_RESULTS_HIST"
        ordering = ["tc_result_hist_id"]


class TestCycleResultHistory(TimestampAuditFields):
    test_cycle_result_hist_id = models.AutoField(primary_key=True)
    created_by = models.TextField(db_column="_created_by", default="system")
    modified_by = models.TextField(db_column="_modified_by", default="system")
    test_cycle_id = models.IntegerField()
    execution_status = models.TextField()
    execution_message = models.TextField(blank=True, null=True)
    test_cycle_result = models.TextField()
    start_at = models.DateTimeField(db_column="start_ts", default=timezone.now)
    end_at = models.DateTimeField(db_column="end_ts", default=timezone.now)
    execution_log_url = models.TextField(blank=True, null=True)
    test_cycle_result_record = models.ForeignKey(
        TestCycleResult,
        db_column="test_cycle_result_id",
        related_name="history",
        on_delete=models.PROTECT,
    )
    domain_name = models.TextField(blank=True, null=True)
    sub_domain_name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_TEST_CYCLE_RESULTS_HIST"
        ordering = ["test_cycle_result_hist_id"]


class MultiStep(models.Model):
    multi_step_id = models.AutoField(primary_key=True)
    test_case = models.ForeignKey(
        TestCase,
        db_column="test_case_id",
        related_name="multi_steps",
        on_delete=models.CASCADE,
    )
    app_name = models.TextField()
    environment = models.TextField()
    payload_format = models.TextField()
    seq_no = models.IntegerField()
    request_payload = models.JSONField()

    class Meta:
        db_table = "T_MULTI_STEP"
        ordering = ["test_case_id", "seq_no"]

    def __str__(self):
        return "{} step {}".format(self.test_case_id, self.seq_no)


class MultiStepResult(TimestampAuditFields):
    multi_step_result_id = models.AutoField(primary_key=True)
    tc_result = models.ForeignKey(
        TestCaseResult,
        db_column="tc_result_id",
        related_name="multi_step_results",
        on_delete=models.CASCADE,
    )
    multi_step_id = models.IntegerField()
    status = models.TextField()
    execution_message = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "T_MULTI_STEP_RESULTS"
        ordering = ["multi_step_result_id"]
