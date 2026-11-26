import { apiSlice } from "./apiSlice";

export const mdtAPISlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserAccessInfo: builder.mutation({
      query: (obj) => ({
        url: "/access-operations",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      providesTags: ["mdtApi"],
    }),
    getTestSuit: builder.mutation({
      query: (obj) => ({
        url: "/test-suite",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),
    getAllSuitesAndCases: builder.mutation({
      query: (obj) => ({
        url: "/test-suite",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),
    getTestCase: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),
    // getConnectionDetails: builder.mutation({
    //   query: (obj) => ({
    //     url: "/access-operations",
    //     method: "POST",
    //     body: JSON.stringify(obj),
    //   }),
    //   invalidatesTags: ["mdtApi"],
    // }),
    deleteTestCase: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),
    createTestSuit: builder.mutation({
      query: (obj) => ({
        url: "/test-suite-create",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get releases and test cycles
    getReleaseTestCycles: builder.mutation({
      query: (obj) => ({
        url: "/test-release",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get all release list

    getAllReleases: builder.mutation({
      query: (obj) => ({
        url: "/test-release",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get release info based on release id
    getReleaseInfo: builder.mutation({
      query: (obj) => ({
        url: "/get-release-info",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //get test cycles linked to releases
    getTestCyclesByReleaseId: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // Get Test Case List
    getTestCaseList: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get list of test cycles based on org & app ID
    getTestCyclesList: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //create new release
    createNewRelease: builder.mutation({
      query: (obj) => ({
        url: "/test-release",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //ceate new test cycle
    createNewTestCycle: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get TestCase info based on Test Cycle id
    getTestCycleInfo: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //Delete release based on Release id
    deleteRelease: builder.mutation({
      query: (obj) => ({
        url: "/test-release",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //Delete release based on Test Cycle id
    deleteTestCycle: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //Delete Testsuite based on Test Suite id
    deleteTestSuite: builder.mutation({
      query: (obj) => ({
        url: "/test-suite",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //Execute Testcase based on test cycle id
    executeTestCase: builder.mutation({
      query: (obj) => ({
        url: "/execute-operations",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    schedulerOperations: builder.mutation({
      query: (obj) => ({
        url: "/scheduler-operations",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get list of test cycles execution based on org & app ID
    getTestCyclesExecutionList: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get test case execution List based on test cycle id
    getTestCasesExecutionList: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //get test case report based on test case result id
    getTestCaseReport: builder.mutation({
      query: (obj) => ({
        url: "/get-test-case-report",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //update test cycle based on test cycle id
    updateTestCycle: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    //update test case based on test case id
    updateTestCase: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    // get logs based on test cycle result id
    getTestCycleLogs: builder.mutation({
      query: (obj) => ({
        url: "/get-test-cycle-log-info",
        method: "GET",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    getAndCreateJaasFolder: builder.mutation({
      query: (obj) => ({
        url: "/mdt-get-and-create-jass-folder",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    pushTestCaseToJaas: builder.mutation({
      query: (obj) => ({
        url: "/mdt-push-test-case-to-jass",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    downloadBulkUploadTemplate: builder.mutation({
      query: (obj) => ({
        url: "/bulk",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    downloadTestSuiteReport: builder.mutation({
      query: (obj) => ({
        url: "/test-suite",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    downloadTestCaseReport: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    downloadTestCycleReport: builder.mutation({
      query: (obj) => ({
        url: "/test-cycle",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    createNewTestCase: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    getIrisDomainList: builder.mutation({
      query: (obj) => ({
        url: "/access-operations",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

    createNewIrisTestCase: builder.mutation({
      query: (obj) => ({
        url: "/test-case",
        method: "POST",
        body: JSON.stringify(obj),
      }),
      invalidatesTags: ["mdtApi"],
    }),

      //update Iris test case based on test case id
      updateIrisTestCase: builder.mutation({
        query: (obj) => ({
          url: "/test-case",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),
      
      updateTestSuite: builder.mutation({
        query: (obj) => ({
          url: "/test-suite",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      bulkUploadTestCases: builder.mutation({
        query: (obj) => ({
            url: "/bulk",
            method: 'POST',
            body: JSON.stringify(obj),
        }),
        invalidatesTags: ['mdtApi'],
      }),

      bulkUploadFalconLiteTestCases: builder.mutation({
        query: (obj) => ({
            url: "/falcon-lite",
            method: 'POST',
            body: JSON.stringify(obj),
        }),
        invalidatesTags: ['mdtApi'],
      }),
      
      bulkUploadTestCaseStatus: builder.mutation({
        query: (obj) => ({
          url: "/bulk",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getNexusLiteTestCases: builder.mutation({
        query: (obj) => ({
          url: "/falcon-lite",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getDashboardData: builder.mutation({
        query: (obj) => ({
          url: "/dashboard-operations",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getJaasProjects: builder.mutation({
        query: (obj) => ({
          url: "/test-case",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      createJaasIssue: builder.mutation({
        query: (obj) => ({
          url: "/test-case",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      viewJaasStatus: builder.mutation({
        query: (obj) => ({
          url: "/test-case",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getTestClosureReport: builder.mutation({
        query: (obj) => ({
          url: "/test-cycle",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getDomainWiseExecutionReport: builder.mutation({
        query: (obj) => ({
          url: "/test-cycle",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getSchemasForDB: builder.mutation({
        query: (obj) => ({
          url: "/sql-operations",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),

      getReleaseReport: builder.mutation({
        query: (obj) => ({
          url: "/test-cycle",
          method: "POST",
          body: JSON.stringify(obj),
        }),
        invalidatesTags: ["mdtApi"],
      }),
  }),
});

export const {
  useGetUserAccessInfoMutation,
  useGetTestSuitMutation,
  useGetAllSuitesAndCasesMutation,
  useGetTestCaseMutation,
  // useGetConnectionDetailsMutation,
  useDeleteTestCaseMutation,
  useCreateTestSuitMutation,
  useGetReleaseTestCyclesMutation,
  useGetAllReleasesMutation,
  useGetReleaseInfoMutation,
  useGetTestCyclesByReleaseIdMutation,
  useGetTestCaseListMutation,
  useGetTestCyclesListMutation,
  useCreateNewReleaseMutation,
  useCreateNewTestCycleMutation,
  useGetTestCycleInfoMutation,
  useDeleteReleaseMutation,
  useDeleteTestCycleMutation,
  useDeleteTestSuiteMutation,
  useExecuteTestCaseMutation,
  useSchedulerOperationsMutation,
  useGetTestCyclesExecutionListMutation,
  useGetTestCasesExecutionListMutation,
  useGetTestCaseReportMutation,
  useUpdateTestCycleMutation,
  useUpdateTestCaseMutation,
  useGetTestCycleLogsMutation,
  useGetAndCreateJaasFolderMutation,
  useGetJaasProjectsMutation,
  usePushTestCaseToJaasMutation,
  useDownloadBulkUploadTemplateMutation,
  useDownloadTestSuiteReportMutation,
  useDownloadTestCaseReportMutation,
  useGetDomainWiseExecutionReportMutation,
  useDownloadTestCycleReportMutation,
  useCreateNewTestCaseMutation,
  useGetIrisDomainListMutation,
  useCreateNewIrisTestCaseMutation,
  useUpdateIrisTestCaseMutation,
  useUpdateTestSuiteMutation,
  useBulkUploadTestCasesMutation,
  useBulkUploadTestCaseStatusMutation,
  useGetNexusLiteTestCasesMutation,
  useGetDashboardDataMutation,
  useCreateJaasIssueMutation,
  useViewJaasStatusMutation,
  useGetTestClosureReportMutation,
  useBulkUploadFalconLiteTestCasesMutation,
  useGetSchemasForDBMutation,
  useGetReleaseReportMutation,
} = mdtAPISlice;
