import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const NavigationButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1, { state: { show: true } });
  };

  const handleForward = () => {
    navigate(1, { state: { show: true } });
  };

  const canGoForward = !window.navigation || window.navigation.canGoForward || window.navigation.canGoForward !== false ? true : false;
  return (
    <div>
      <IconButton onClick={handleBack}>
        <ArrowBack />
      </IconButton>
      <IconButton onClick={handleForward} disabled={!canGoForward}>
        <ArrowForward />
      </IconButton>
    </div>
  );
};

export default NavigationButtons;
