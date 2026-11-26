const demoData = require("../assets/json/demo-data.json");

const uiApiActions = [
  "list-test-cycles", "list-releases", "list-test-cases", "get-suite-cases",
  "release-create", "test-cycle-create", "get_dashboard_stats", "mdt-get-user-access-info",
  "token-exchange", "get-test-suites", "falcon-create-bulk-tc", "falcon-create-bulk-tc/get-status",
  "get-executions", "mdt-download-report", "mdt-download-test-cycle-report", "mdt-change-status",
  "execute", "get-test-case-executions", "mdt-stop-execution", "get-test-execution-logs",
  "get-jaas-projects", "create-jaas-ticket", "get-jaas-status", "get-multistep-logs",
  "falcon-lite-nexus-bulk-upload", "get-nexus-test-cases", "get-nexus-cycle-executions",
  "get-nexus-domains", "nexus-lite-execution", "get-falcon-lite-bulk-upload-template",
  "get-release-testcycles", "release-delete", "test-cycle-delete", "get-test-cycles",
  "generate_test_cycle_report", "generate_domain_report", "generate_release_report",
  "get_schedule_details", "mdt-validate-sql", "test-case-delete", "get-bulk-upload-templet",
  "test-suite-delete", "test-suite-modify", "test-suite-create", "get-test-cases",
  "get-all-jaas-tickets", "get-test-cycle-info", "test-cycle-modify", "test-case-create",
  "mdt-get-iris-response", "generate-file-upload-url", "mdt-modify-iris-testcase",
  "modify-nexus-testcase", "create-nexus-testcase", "mdt-question-sql-generation",
  "get-workspace-id", "mdt-entity-handler", "mdt-create-iris-testcase",
  "get-test-case-report", "mdt-download-test-suite", "get-test-cycle-log-info",
  "mdt-get-and-create-jass-folder", "mdt-push-test-case-to-jass", "scheduler",
];

describe("demo API response fixtures", () => {
  test("provides a JSON response for every UI API action", () => {
    const missingActions = uiApiActions.filter((action) => !demoData.apiResponses[action]);
    expect(missingActions).toEqual([]);
  });

  test("includes representative records for the demo workflow", () => {
    expect(demoData.access.body.organizations.length).toBeGreaterThan(0);
    expect(demoData.testSuites.some((suite) => suite.test_cases.length > 0)).toBe(true);
    expect(demoData.releases.length).toBeGreaterThan(0);
    expect(demoData.testCycles.length).toBeGreaterThan(0);
    expect(demoData.apiResponses["mdt-question-sql-generation"].body[0]).toHaveProperty("sql");
    expect(demoData.apiResponses["generate-file-upload-url"].body).toHaveProperty("upload_url");
  });

  test("read responses match the UI envelope contracts", () => {
    expect(demoData.apiResponses["list-releases"].data.releases[0]).toHaveProperty("release_id");
    expect(demoData.apiResponses["list-test-cycles"].body.test_cycles[0]).toHaveProperty("test_cycle_id");
    expect(demoData.apiResponses["list-test-cases"].body.test_cases[0]).toHaveProperty("test_case_id");
    expect(demoData.apiResponses["get-test-cycle-info"].data.test_suites[0].test_cases[0]).toHaveProperty("depends_on");
    expect(demoData.apiResponses["generate_test_cycle_report"]).toHaveProperty("test_cycle_summary");
    expect(demoData.apiResponses["get-all-jaas-tickets"].body.data[0]).toHaveProperty("jaas_key");
    expect(demoData.apiResponses["get-nexus-cycle-executions"].data.test_cycle_executions.length).toBeGreaterThan(0);
  });
});
