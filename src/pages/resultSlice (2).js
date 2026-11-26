import { getDataFromStorage, clearAllDataFromStorage } from "../utils/utility";

import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  results: [],
  status: "idle",
  error: null,
  success: "",
  loading:false
};
const token = getDataFromStorage("token");
if (token) {
  // Add authorization header if a token exists
  // console.log("token", token);
}

export const getResults = createAsyncThunk("results/getResults", async (data) => {
  // const data = {
    // test_suite_execution: {
    //   service: "test_suite_execution",
    //   org: "company_ops",
    //   "app-name": "codw",
    //   env: "dev",
    //   "test-suite": "Test_Suite_1",
    // },
    // service: "test_case_execution",
    // org: "company_ops",
    // "app-name": "codw",
    // env: "dev",
    // "test-suite": "Default",
    // "test-case": "Test Case4",

    // test_case_execution: {
    //   service: "test_case_execution",
    //   org: "company_ops",
    //   "app-name": "codw",
    //   env: "dev",
    //   "test-suite": "Default",
    //   "test-case": "Test Case4",
    // },
    // test_case_addition: {
    //   service: "test_case_addition",
    //   org: "company_ops",
    //   "app-name": "codw",
    //   env: "dev",
    //   "test-suite": "Test_Suite_1",
    //   "test-case": "Test Case10",
    //   test-case-type": "SameSourceTarget",
    //   "source-type": "snowflake",
    //   "sourc"test-case-description": "Test Case 10 Descr",
    //   "e-conn": "codw1",
    //   "target-type": "snowflake",
    //   "target-conn": "codw1",
    //   "source-object-type": "query",
    //   "source-object": "src_query_object_id",
    //   "target-object-type": "query",
    //   "target-object": "tgt_query_object_id",
    //   "tc-pattern": "compare_all",
    //   "key-cols": "SOURCE_SYSTEM_NAME,CALENDAR_ID",
    //   "log-group": "company_ops/codw/dev/company_ops_codw_dev_ts_sales_jul_rel",
    // },
  // };
  //const response = await axios.get('https://jsonplaceholder.typicode.com/users');
  const response = await fetch(
    "https://v9et63woha.execute-api.us-west-2.amazonaws.com/beta/mdt-framework",
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        //"Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
        //"Access-Control-Allow-Origin": "*",
      },
    }
  );
  console.log("APIresponse", response);
  return response.data;
});

const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    // omit existing reducers here
  },
  extraReducers(builder) {
    builder
      .addCase(getResults.pending, (state, action) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(getResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        // Add any fetched posts to the array
        // console.log("actionoutput", action.payload);
        state.results = "Execution Succeeded";
        state.success ="Execution Succeeded";
       // state.error = "Something Went Wrong";
        //state.results = state.results.concat(action.payload);
      })
      .addCase(getResults.rejected, (state, action) => {
        state.status = "failed";
        state.loading=false;
        state.error = action.error.message;
      });
  },
});

export default resultsSlice.reducer;
