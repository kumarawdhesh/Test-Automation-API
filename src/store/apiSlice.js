// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
//https://github.com/parcel-bundler/parcel/issues/7622
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { getDataFromStorage,clearAllDataFromStorage } from "../utils/utility";
import { FALCON_API } from "../../environment";
import { demoApiResult } from "../api/demoApi";
import { DEMO_MODE, LOCAL_API_MODE } from "../../environment";

const customBaseQuery = fetchBaseQuery({ baseUrl: FALCON_API });
// Create a custom base query function that adds authorization headers
const baseQueryWithAuthorizationFn = async (args, api, extraOptions) => {
  if (DEMO_MODE && !LOCAL_API_MODE) {
    return demoApiResult(args);
  }

  args.headers = args.headers || {};
  const token = getDataFromStorage("token");
  if (token) {
    // Add authorization header if a token exists
    args.headers["Authorization"] = `Bearer ${token}`;
  }
  // return customBaseQuery(args, api, extraOptions);
  try {
    const response = await customBaseQuery(args, api, extraOptions);
    // Check if the response contains an error related to token expiration
    // console.log(response)
    // console.log(response?.meta?.response?.status)
    if (response?.meta && response?.meta?.response?.status === 401) {
      redirectToLogin();
    }
    return response;
  } catch (error) {
    // Handle other errors here, e.g., network errors
    console.error("Network error:", error);
    throw error;
  }
};

export const redirectToLogin = () => {
  clearAllDataFromStorage()
  window.location.href = '/tokenexpired';
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthorizationFn,
  tagTypes: ["mdtApi",],
  endpoints: (builder) => ({
    getUserAccess: builder.mutation({
      query: (obj) => ({
        url: "/access-operations",
        method: "POST",
        body: JSON.stringify(obj),
      }),
    }),
  }),
});


export const {
  useGetUserAccessMutation,
} = apiSlice
