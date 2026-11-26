import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import authReducer from "./authSlice";
import appReducer from "./appSlice";
import dataReducer from "./dataSlice";
import resultReducer from "./resultSlice";
import testCaseReducer from "./testCaseSlice";
import testCasesResultsReducer from "./testCasesResults"

// const composeEnhancer =
//   (process.env.NODE_ENV !== 'production' &&
//     window &&
//     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
//   compose;
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    app: appReducer,
    data: dataReducer,
    result: resultReducer,
    testCases: testCaseReducer,
    testCasesResults: testCasesResultsReducer
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['app/openDialog', 'app/closeDialog'],
      ignoredPaths: ['app.confirmDialog.onConfirm','app.confirmDialog.onCancel'],
    },
  }).concat(apiSlice.middleware),
});
