import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Typography } from "@mui/material";
import BrandMark from "../BrandMark/BrandMark";

export const Footer = () => {

  return (
    <AppBar position="fixed" sx={{ top: "auto", bottom: 0 ,  zIndex: (theme) => theme.zIndex.drawer + 2}}>
      <Toolbar
        sx={{
          backgroundColor: "#E0E0E0",
          color: "#282828",
          typography: "body1"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BrandMark size={28} />
          <Typography
            variant="subtitle2"
            style={{ color: 'black', fontWeight: 600 }}
          >
            I Link Automation Tool
            </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
};
