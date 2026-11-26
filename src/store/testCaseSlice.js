import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  success: "",
  status: "pending",
  error: "",
  loading: false,
};


const testCaseSlice = createSlice({
  name: "testCases",
  initialState,
  reducers: {},
});

export default testCaseSlice.reducer;
