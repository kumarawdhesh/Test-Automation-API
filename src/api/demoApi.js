import fixtureData from "../assets/json/demo-data.json";
import { DEMO_MODE, LOCAL_API_MODE } from "../../environment";
import * as XLSX from "xlsx";

const clone = (value) => JSON.parse(JSON.stringify(value));
const demoData = clone(fixtureData);

const success = (data) => ({ data });
const response = (body, extra = {}) => ({ statusCode: 200, body, ...extra });
const demoReportUrl = "/__demo_report__";

const createDemoWorkbook = () => {
  const workbook = XLSX.utils.book_new();
  const summary = XLSX.utils.json_to_sheet([
    { Metric: "Test cycle", Value: "Checkout RC 2" },
    { Metric: "Pass rate", Value: "67%" },
    { Metric: "Passed cases", Value: 2 },
    { Metric: "Failed cases", Value: 1 },
  ]);
  const details = XLSX.utils.json_to_sheet(demoData.testSuites[0].test_cases.map((testCase) => ({
    TestCaseId: testCase.test_case_id,
    TestCaseName: testCase.test_case_name,
    Status: testCase.status,
    Expected: testCase.target_sql || testCase.target_query,
    Message: testCase.execution_message,
  })));
  XLSX.utils.book_append_sheet(workbook, summary, "Summary");
  XLSX.utils.book_append_sheet(workbook, details, "Exact Match");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
};

const getTestSuiteRows = () => clone(demoData.testSuites);
const getCycleRows = (releaseIds) => demoData.testCycles.filter((cycle) => !releaseIds?.length || releaseIds.includes(cycle.release_id));

export function demoApiResult(args) {
  const body = typeof args.body === "string" ? JSON.parse(args.body) : args.body || {};
  const action = body.function_name || "";

  switch (action) {
    case "mdt-get-user-access-info":
    case "get-user-access-info":
      return success(response(demoData.access.body));
    case "get_dashboard_stats":
      return success(clone(demoData.dashboard));
    case "get-suite-cases": {
      const search = String(body.search_word || "").toLowerCase();
      const suites = getTestSuiteRows().filter((suite) =>
        !search || `${suite.test_suite_id} ${suite.test_suite_name} ${suite.test_suite_desc}`.toLowerCase().includes(search)
      );
      const start = Number(body.offset || 0);
      const limit = Number(body.limit || suites.length || 1);
      return success(response({ data: suites.slice(start, start + limit), overll_test_suite_count: suites.length }));
    }
    case "get-test-suites":
      return success(response({ test_suites: getTestSuiteRows().map((suite) => ({ id: suite.test_suite_id, name: suite.test_suite_name, description: suite.test_suite_desc, ...suite })) }));
    case "get-test-cases": {
      const suiteIds = body.test_suite_ids || [];
      const cases = demoData.testSuites.filter((suite) => !suiteIds.length || suiteIds.includes(suite.test_suite_id)).flatMap((suite) => suite.test_cases);
      return success(response({ test_cases: clone(cases) }));
    }
    case "list-releases":
      return success({ statusCode: 200, data: { releases: clone(demoData.releases) } });
    case "list-test-cycles":
      return success(response({ test_cycles: clone(demoData.testCycles) }));
    case "list-test-cases":
      return success(response({ test_cases: clone(demoData.testSuites.flatMap((suite) => suite.test_cases)) }));
    case "get-release-testcycles":
      return success({ statusCode: 200, data: { releases: clone(demoData.releases), test_cycles: clone(demoData.testCycles) } });
    case "get-test-cycles":
      return success(response({ test_cycles: clone(getCycleRows(body.release_ids)) }));
    case "get-test-cycle-info": {
      const selectedCycle = demoData.testCycles.find((cycle) => cycle.test_cycle_id === body.test_cycle_id) || demoData.testCycles[0];
      return success({ statusCode: 200, data: { test_cycle: clone(selectedCycle), test_suites: [{ ...clone(demoData.testSuites[0]), test_cases: clone(demoData.testSuites[0].test_cases) }] } });
    }
    case "get-executions": {
      const cycles = demoData.testCycles.map((cycle) => ({
        ...cycle,
        test_cycle_result_id: `RUN-${cycle.test_cycle_id}`,
        total_pass_count: cycle.total_pass_count,
        total_test_case_count: cycle.total_test_case_count,
        pass_percentage: Math.round((cycle.total_pass_count / cycle.total_test_case_count) * 100),
      }));
      return success({ statusCode: 200, data: { test_cycle_executions: cycles, total_count: cycles.length } });
    }
    case "get_schedule_details":
      return success(response(clone(demoData.schedules)));
    case "get-nexus-domains":
      return success(response([{ domain_name: "Analytics Demo", workspace_name: "Retail Insights", workspace_id: "WS-301", connection_id: "demo-snowflake-analytics" }]));
    case "get-nexus-test-cases":
      return success(response({ data: [{ test_case_id: "NX-301", test_case_name: "Daily revenue is non-negative", target_sql: "SELECT SUM(revenue) FROM daily_sales", modified_by: "Local Explorer", modified_at: "2026-10-24" }] }));
    case "get-nexus-cycle-executions":
      return success({ statusCode: 200, data: { test_cycle_executions: clone(demoData.testCycles) } });
    case "mdt-get-all-schema-tables":
      return success(response(clone(demoData.schemas)));
    case "mdt-get-schema-tables-columns-details":
      return success(response({
        columns: clone(demoData.columns),
        mappings: { default_mappings: [{ sourceTable: "ORDERS", sourceColumn: "ORDER_TOTAL", targetTable: "ORDERS", targetColumn: "TOTAL_AMOUNT", transformation: [] }], llm_mappings: [], variant_mappings: [] },
        data_test_scenarios: { data_test_scenarios: clone(demoData.scenarios) },
        llm_scenarios: [],
      }));
    case "mdt-data-testing-sql-generation":
      return success(response({ sql_queries: [{ test_scenario: "Order totals match", source_sql: "SELECT SUM(ORDER_TOTAL) FROM ORDERS", target_sql: "SELECT SUM(TOTAL_AMOUNT) FROM ORDERS", status: "Generated" }] }));
    case "get-test-case-executions":
    {
      const cycle = demoData.testCycles.find((item) => item.test_cycle_result_id === body.test_cycle_result_id || item.test_cycle_id === body.test_cycle_result_id);
      const testCases = cycle?.test_cases?.length ? cycle.test_cases : demoData.testSuites[0].test_cases;
      return success({ statusCode: 200, data: { test_cases: clone(testCases) } });
    }
    case "get-test-execution-logs":
      return success(response(JSON.stringify({ data: [{ timestamp: "2026-10-24T15:00:00Z", message: "Validation started" }, { timestamp: "2026-10-24T15:00:02Z", message: "All assertions passed" }] })));
    case "execute":
      return success(response({ message: `${body.test_cases?.length || 1} test case(s) queued in local demo mode.` }));
    case "test-suite-create": {
      const suite = {
        test_suite_id: `TS-${2400 + demoData.testSuites.length + 1}`,
        test_suite_name: body.test_suite_name || body.testSuiteName || "New Demo Suite",
        test_suite_desc: body.test_suite_description || body.testSuiteDescription || "Created in local demo mode.",
        _modified_by: "Local Explorer",
        test_cases: [],
      };
      demoData.testSuites.unshift(suite);
      return success(response("Test suite created in local demo data."));
    }
    case "release-create": {
      const release = {
        release_id: `REL-DEMO-${demoData.releases.length + 1}`,
        release_name: body.release_name || "New Demo Release",
        release_desc: body.release_desc || "Created in local demo mode.",
        status: "In Progress",
        start_date: body.release_date || "2026-10-28",
      };
      demoData.releases.unshift(release);
      return success({ statusCode: 200, message: "Demo release created." });
    }
    case "test-cycle-create": {
      const cycle = {
        test_cycle_id: `CY-DEMO-${demoData.testCycles.length + 1}`,
        test_cycle_result_id: `RUN-CY-DEMO-${demoData.testCycles.length + 1}`,
        test_cycle_name: body.test_cycle_name || "New Demo Cycle",
        release_id: body.release_ids?.[0] || demoData.releases[0]?.release_id,
        status: "Not Executed",
        time_stamp: new Date().toISOString(),
        user_id: "local.explorer@ilink.demo",
        total_test_case_count: body.test_cases?.length || 0,
        total_pass_count: 0,
        test_cases: clone(body.test_cases || []),
      };
      demoData.testCycles.unshift(cycle);
      return success({ statusCode: 200, message: "Demo test cycle created." });
    }
    case "test-suite-modify": {
      const suite = demoData.testSuites.find((item) => item.test_suite_id === body.test_suite_id);
      if (suite) {
        suite.test_suite_name = body.test_suite_name || suite.test_suite_name;
        suite.test_suite_desc = body.test_suite_description || suite.test_suite_desc;
      }
      return success(response("Test suite updated in local demo data."));
    }
    case "test-suite-delete": {
      demoData.testSuites = demoData.testSuites.filter((suite) => suite.test_suite_id !== body.test_suite_id);
      return success({ statusCode: 200, message: "Demo test suite deleted." });
    }
    case "release-delete": {
      demoData.releases = demoData.releases.filter((release) => release.release_id !== body.release_id);
      demoData.testCycles = demoData.testCycles.filter((cycle) => cycle.release_id !== body.release_id);
      return success({ statusCode: 200, message: "Demo release deleted." });
    }
    case "test-cycle-delete": {
      demoData.testCycles = demoData.testCycles.filter((cycle) => cycle.test_cycle_id !== body.test_cycle_id);
      return success({ statusCode: 200, message: "Demo test cycle deleted." });
    }
    case "test-case-delete":
      return success({ statusCode: 200, message: "Demo test case deleted." });
    case "mdt-change-status": {
      const resultId = body.test_case_result_id || body.tc_result_id || body.test_cycle_result_id;
      for (const cycle of demoData.testCycles) {
        if (cycle.test_cycle_result_id === resultId || cycle.test_cycle_id === resultId) cycle.status = body.status || cycle.status;
        for (const testCase of cycle.test_cases || []) {
          if (testCase.test_case_result_id === resultId || testCase.test_case_id === resultId) testCase.status = body.status || testCase.status;
        }
      }
      return success({ statusCode: 200, message: `Demo status changed to ${body.status || "updated"}.` });
    }
    case "mdt-stop-execution": {
      const cycle = demoData.testCycles.find((item) => item.test_cycle_result_id === body.test_cycle_result_id || item.test_cycle_id === body.test_cycle_id);
      if (cycle) cycle.status = "Force Stop";
      return success({ statusCode: 200, message: "Demo execution stopped." });
    }
    case "test-case-create":
    case "mdt-create-iris-testcase":
    case "create-nexus-testcase":
      return success(clone(demoData.apiResponses[action]));
    case "test-case-modify":
    case "mdt-modify-iris-testcase":
    case "modify-nexus-testcase":
    case "test-cycle-modify":
    case "mdt-change-status":
    case "mdt-stop-execution":
      return success(clone(demoData.apiResponses[action]));
    case "get-workspace-id":
    case "mdt-entity-handler":
    case "mdt-question-sql-generation":
    case "mdt-get-iris-response":
    case "mdt-validate-sql":
    case "generate-file-upload-url":
    case "falcon-create-bulk-tc":
    case "falcon-create-bulk-tc/get-status":
    case "get-bulk-upload-templet":
    case "get-falcon-lite-bulk-upload-template":
    case "mdt-download-report":
    case "mdt-download-test-cycle-report":
    case "mdt-download-test-suite":
    case "get-test-case-report":
    case "get-jaas-projects":
    case "create-jaas-ticket":
    case "get-jaas-status":
    case "get-multistep-logs":
    case "get-all-jaas-tickets":
    case "generate_domain_report":
    case "generate_release_report":
    case "nexus-lite-execution":
    case "falcon-lite-nexus-bulk-upload":
    case "get-test-cycle-log-info":
    case "get-and-create-jaas-folder":
    case "mdt-get-and-create-jass-folder":
    case "mdt-push-test-case-to-jass":
      return success(clone(demoData.apiResponses[action]));
    case "scheduler":
      return success(response("Schedule action simulated in local demo mode."));
    case "generate_test_cycle_report":
      return success(clone(demoData.reportExamples.testCycleSummary));
    case "generate_domain_report":
      return success(response(clone(demoData.reportExamples.domainWise)));
    case "generate_release_report":
      return success(response(clone(demoData.reportExamples.releaseWise)));
    case "mdt-download-report":
    case "mdt-download-test-cycle-report":
    case "get-test-case-report":
      return success(response({ download_url: demoReportUrl, file_password: null }));
    case "mdt-download-test-suite":
      return success({ statusCode: 200, s3url: demoReportUrl, message: "Synthetic demo workbook is ready." });
    case "generate-file-upload-url":
      return success(response({ upload_url: `${window.location.origin}/__demo_upload__`, s3_uri: "demo://uploads/sample-test-data.csv", fields: { key: "demo/sample-test-data.csv" } }));
    default:
      if (demoData.apiResponses[action]) {
        return success(clone(demoData.apiResponses[action]));
      }
      return success(response({ message: `Local demo response for ${action || args.url || "request"}.`, records: [] }));
  }
}

export function installDemoFetch(falconApi, guardianApi) {
  if (!DEMO_MODE || LOCAL_API_MODE || globalThis.__iLinkDemoFetchInstalled) return;

  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.endsWith(demoReportUrl)) {
      return new Response(createDemoWorkbook(), {
        status: 200,
        headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      });
    }
    if (url === `${window.location.origin}/__demo_upload__`) {
      return new Response(null, { status: 201 });
    }
    if (!url.startsWith(falconApi) && !url.startsWith(guardianApi.split("?")[0])) {
      return originalFetch(input, init);
    }

    if (url.startsWith(guardianApi.split("?")[0])) {
      return new Response(JSON.stringify({ statusCode: 200, connection_name: clone(demoData.connections) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = demoApiResult({ url, method: init.method || "GET", body: init.body });
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  globalThis.__iLinkDemoFetchInstalled = true;
}
