import React, { useState, useEffect } from "react";
import  Typography  from "@mui/material/Typography";
import  Container  from "@mui/material/Container";
import { useNavigate } from "react-router-dom";
import { getDataFromStorage } from "../../utils/utility";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  countdown: {
    fontWeight: "bold",
  },
};

const TokenExpired = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  let exp = getDataFromStorage("exp");

  useEffect(() => {
    if (exp != "") {
      navigate("/login");
      return
    }
    const countdownInterval = setInterval(() => {
      if (countdown === 0) {
        clearInterval(countdownInterval);
        // Redirect to the login page when countdown reaches 0
        navigate("/login");
      } else {
        // Decrease the countdown by 1 every second
        setCountdown(countdown - 1);
      }
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(countdownInterval);
    };
  }, [countdown]);

  return (
    exp == "" && (
      <Container style={styles.container} className="main-container">
        <Typography variant="body1" gutterBottom>
          Your token has expired.
        </Typography>
        <Typography variant="body1" gutterBottom>
          You will be redirected to the login page in
          <span style={styles.countdown}> {countdown} </span> seconds.
        </Typography>
      </Container>
    )
  );
};

export default TokenExpired;
