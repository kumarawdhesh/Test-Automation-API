import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DEMO_MODE } from "../../../environment";

export const Protected = ({ children }) => {
  const userData = useSelector((state) => state.auth.user);

  if (DEMO_MODE) {
    return children;
  }

  // Check if the user is signed in
  const isSignedIn = userData && userData.username && userData.username.trim() !== "";

  if (isSignedIn) {
    return children; // Allow access to the protected route
  } else {
    return <Navigate to="/login" />; // Redirect to login if not signed in
  }
};

export const ProtectedAuthUser = ({ children }) => {
  const userData = useSelector((state) => state.auth.user);

  if (DEMO_MODE) {
    return <Navigate to="/home" />;
  }

  // Check if the user is signed in
  const isSignedIn = userData && userData.username && userData.username.trim() !== "";

  if (isSignedIn) {
    return <Navigate to="/home" />; // Redirect to home if signed in
  } else {
    return children; // Allow access to the route for unauthenticated users
  }
};
