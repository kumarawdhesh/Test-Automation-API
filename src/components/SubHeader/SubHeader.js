import React from "react";
import BreadcrumbComponent from "../BreadcrumbComponent/BreadcrumbComponent";
import Home from "../../pages/Home/Home";
import { Box, Grid } from "@mui/material";
import * as classes from "./SubHeader.module.css";
import BackButton from "../NavigationButton/NavigationButton";

const SubHeader = () => {
  return (
    <>
      <Box className={classes["sub-header"]}>

        <Grid item xs={12} sx={{ margin: location.pathname === "/home" && "70px 10px" }}>
          <Home />
        </Grid>
      </Box>
      {/* <div style={{ marginLeft: "25px" }}>
        <BackButton />
      </div> */}
    </>
  );
};
export default SubHeader;
