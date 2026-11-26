import React, { useEffect, useState } from "react";
import { clearAllDataFromStorage } from "../../utils/utility";
//import { showSnackbar } from "../../store/appSlice";
import { useDispatch } from "react-redux";

// Define the token expiration warning threshold in seconds (5 minutes).
const TOKEN_WARNING_THRESHOLD = 300;

// Define the token expiration check interval in milliseconds (1 minute).
const CHECK_INTERVAL = 60000;

const TokenExpirationWrapper = (WrappedComponent) => {
  return function withTokenExpiration(props) {
    const tokenExpirationFromStorage = sessionStorage.getItem("exp");
    const dispatch = useDispatch();

    const tokenExpiration = tokenExpirationFromStorage
      ? parseInt(tokenExpirationFromStorage)
      : null;

    useEffect(() => {
      const checkTokenExpiration = () => {
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        const alert_shown = sessionStorage.getItem("alert_shown");
        let alertShown = alert_shown === "true";
        if (tokenExpiration) {
          const currentTimeLocal = new Date(currentTime * 1000);
          const tokenExpirationLocal = new Date(tokenExpiration * 1000);
          // console.log("current time ",currentTimeLocal.toLocaleString())
          // console.log("Expired time ",tokenExpirationLocal.toLocaleString())
          if (
            tokenExpiration - currentTime <= TOKEN_WARNING_THRESHOLD &&
            !alertShown
          ) {
            // Show a warning message 5 minutes before token expiration.
            sessionStorage.setItem("alert_shown", "true");
            // alert('Your session is nearing its end. Kindly re-authenticate to maintain uninterrupted access.');
            dispatch(
              showSnackbar({
                message:
                  "Your session is nearing its end. Kindly re-authenticate to maintain uninterrupted access.",
                className: "color-error-background",
                mandateClose: true,
              })
            );
          }
          if (alertShown && tokenExpiration < currentTime + 65) {
            // add one more minute
            clearAllDataFromStorage();
            // Token has expired, redirect to a token expired page.
            window.location.href = "/tokenexpired"; // Replace with your desired URL.
          }
        }
      };

      const intervalId = setInterval(checkTokenExpiration, CHECK_INTERVAL);

      return () => {
        clearInterval(intervalId);
      };
    }, [tokenExpiration]);

    return <WrappedComponent {...props} />;
  };
};

export default TokenExpirationWrapper;
