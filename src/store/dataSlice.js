import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getUserAccessInfo: [],
  getReleasesAndTestCyclesData: {},
  selectedOrgAppDetails: {
    orgName: "",
    appName: "",
  },
  selectedTestcycleId: null,
  selectedReleaseId: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setMdtData: (state, action) => {
      return { ...state, ...action.payload };
    },
    setUserAccessInfo: (state, action) => {
      state.getUserAccessInfo = action.payload;
    },
    setReleaseAndCyclesData: (state, action) => {
      state.getReleasesAndTestCyclesData = action.payload;
    },
    setSelectedOrgAppDetails: (state, action) => {
      state.selectedOrgAppDetails = { ...action.payload };
    },
    setSelectedTestcycleId: (state, action) => {
      state.selectedTestcycleId = action.payload;
    },
    setSelectedReleaseId: (state, action) => {
      state.selectedReleaseId = action.payload;
    },
  },
});

export const { setMdtData, setUserAccessInfo, setReleaseAndCyclesData, setSelectedOrgAppDetails, setSelectedTestcycleId, setSelectedReleaseId } = dataSlice.actions;

export default dataSlice.reducer;
