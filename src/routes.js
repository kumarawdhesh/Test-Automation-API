import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Error from "./components/Error/Error";
import AppLayout from "./layout/AppLayout/AppLayout";
const CreateTestSuite = lazy(()=> import("../src/pages/CreateTestSuite/CreateTestSuite"));
const TestCase = lazy(() => import("../src/pages/TestCase/TestCase"));
const ExecutionHistory = lazy(() => import("./pages/ExecutionHistory/ExecutionHistory"));
const TestCaseList = lazy(() => import("./pages/TestCaseList/TestCaseList"));
const ReleaseTestCycleHistory = lazy(() => import("./pages/ReleaseTestCycleHistory/ReleaseTestCycleHistory"));
const TestCycleAndCases = lazy(() => import("./pages/TestCycle&Cases/TestCycle&Cases"));
import {
  ExecuteHistoryShimmer,
  TestSuiteHistoryShimmer,
  LoginShimmer,
  HomeShimmer,
  TestSuiteDetailsShimmer,
  TestCaseShimmer,
  LandingPageShimmer,
  TestCycleAndCasesShimmer,
  ReleasesAndCycleShimmer,
} from "./components/ShimmerEffect/ShimmerEffect";
const AdminConsole = lazy(() => import("./pages/AdminConsole/AdminConsole"));
const Home = lazy(() => import("./pages/Home/Home"));
import { Protected, ProtectedAuthUser } from "./components/Protected/Protected";
import { Auth } from "./pages/Auth/Auth";
import AccessCheck from "./pages/AccessCheck/AccessCheck";
import LandingPage from "./pages/LandingPage/LandingPage";
import TokenExpired from "./pages/TokenExpired/TokenExpired";
import IrisTestCase from "./pages/IrisTestCase/IrisTestCase";
import TestsuiteDetails from "./pages/TestsuiteDetails/TestsuiteDetails";
import TestSuiteHistory from "./pages/TestSuiteHistory/TestSuiteHistory";
import Schedule from "./pages/Schedule/Schedule";
import TestCaseQuestionGenerate from "./pages/TestCase/TestCaseQuestionGenerate";
import TestCaseGeneratorParent from "./pages/TestCase/TestCaseGeneratorParent";
import NexusTesting from "./pages/FalconLite/NexusTesting";
import LiteAuthCallBack from "./pages/Auth/LiteAuthCallBack";
import {View as JaasIssues} from "./pages/JaasIssues/View";
import Reports from "./pages/Reports/Reports";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/home",
        element: (
          <Suspense fallback={<HomeShimmer/>}>
            <Protected>
              <Home />
            </Protected>
          </Suspense>
        ),
      },
      {
        path: "/testsuite-history",
        element: (
          <Suspense fallback={<TestSuiteHistoryShimmer/>}>
            <Protected>
              <TestSuiteHistory/>
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/releases-testcycle",
        element: (
          <Suspense fallback={<ReleasesAndCycleShimmer/>}>
            <Protected>
              <ReleaseTestCycleHistory />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/testsuite-create",
        element: (
          <Suspense fallback={"loading...."}>
            <Protected>
              <CreateTestSuite />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/testcase-list",
        element: (
          <Suspense fallback={"loading...."}>
            <Protected>
              <TestCaseList />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/testsuite/testcase-create",
        element: (
          <Suspense fallback={<TestCaseShimmer/>}>
            <Protected>
              <TestCase />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/testsuite/question-generate",
        element: (
          <Suspense fallback={<TestCaseShimmer/>}>
            <Protected>
              <TestCaseQuestionGenerate/>
            </Protected>
          </Suspense>
        )
      },

      // {
      //   path: "/testsuite/testcase-create-wizard",
      //   element: (
      //     <Suspense fallback={<TestCaseShimmer/>}>
      //       <Protected>
      //         <TestCaseWizard />
      //       </Protected>
      //     </Suspense>
      //   )
      // },
      {
        path: "/execution-history",
        element: (
          <Suspense fallback={<ExecuteHistoryShimmer/>}>
            <Protected>
              <ExecutionHistory />
            </Protected>
          </Suspense>
        ),
      },
      {
        path: "/schedule",
        element: (
          <Suspense fallback={"loading...."}>
            <Protected>
              <Schedule />
            </Protected>
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<LoginShimmer />}>
             <ProtectedAuthUser>
              <LandingPage />
             </ProtectedAuthUser>
          </Suspense>
        ),
      },
      {
        path: "/testcycle-details/:id/*",
        element: (
          <Suspense fallback={<TestCycleAndCasesShimmer/>}>
            <Protected>
              <TestCycleAndCases />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/admin-console",
        element: (
          <Suspense fallback={"loading...."}>
             <Protected>
            <AdminConsole />
            </Protected>
          </Suspense>
        ),
      },
      {
        path: '/authcallback',
        element: <Auth />
      },
      {
        path: '/tokenexpired',
        element: <TokenExpired />
      },
      {
        path: '/',
        element: <Navigate to="/landing-Page" />
      },
      {
        path: "/testcase/:id/*", 
        element: (
          <Suspense fallback={<TestCaseShimmer/>}>
            <Protected>
              <TestCase />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/landing-Page",
        element: (
          <Suspense fallback={<LandingPageShimmer/>}>
            <ProtectedAuthUser>
              <LandingPage />
            </ProtectedAuthUser>
          </Suspense>
        ),
      },
      {
        path: "/testsuite/iris-testcase-create",
        element: (
          <Suspense fallback={"loading..."}>
            <Protected>
              <IrisTestCase/>
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/testsuite-details/:id/*",
        element: (
          <Suspense fallback={<TestSuiteDetailsShimmer/>}>
            <Protected>
              <TestsuiteDetails/>
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/view-jaas-issues",
        element: (
          <Suspense fallback={"loading..."}>
            <Protected>
              <JaasIssues />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/reports",
        element: (
          <Suspense fallback={"loading..."}>
            <Protected>
              <Reports />
            </Protected>
          </Suspense>
        )
      },
      {
        path: "/testcase-generation",
        element: (
          <Suspense fallback={"loading..."}>
            <Protected>
              <TestCaseGeneratorParent />
            </Protected>
          </Suspense>
        )
      }
    ],
    errorElement: <Error />,
  },
  {
    path: "/falcon-lite/nexus/authcallback",
    element: <LiteAuthCallBack />
  },
  {
    path: "/falcon-lite/nexus",
    element: <NexusTesting />
  },
  {
    path: '/accesscheck',
    element: <AccessCheck />
  },
]);
