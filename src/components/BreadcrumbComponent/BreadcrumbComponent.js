import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Typography, Breadcrumbs } from "@mui/material";

const breadcrumbNameMap = {
  "/": "",
  "/testsuite-history": "Test Suite History",
  "/releases-testcycle": "Release & Test Cycles",
  "/testsuite-create": "CreateTestSuite",
  "/testcase-list": "TestCaseList",
  "/testsuite-history/testcase-create": "TestCase",
  "/execution-history": "Execution History",
  "/releases-testcycle/:id": "Releases",
  "/testsuite-history/:id": "edit-testCase",
  "/testsuite-details/:id": "Testsuite details",
};

const BreadcrumbComponent = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink underline="hover" color="secondry" to="/">
          <Typography>Home</Typography>
        </RouterLink>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          if (breadcrumbNameMap[to]) {
            return (
              <RouterLink key={to} to={to} color="inherit">
                <Typography>{breadcrumbNameMap[to]}</Typography>
              </RouterLink>
            );
          } else if (isLast) {
            return (
              <Typography key={to} color="textPrimary">
                {pathnames.slice(0, index + 1).join("/")}
              </Typography>
            );
          }
          return null;
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbComponent;
