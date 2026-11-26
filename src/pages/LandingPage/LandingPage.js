import { useEffect } from "react";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import BrandMark from "../../components/BrandMark/BrandMark";

import * as classes from "./Login.module.css";
import { DEMO_MODE, FALCON_LOGIN_URL_CODE } from "../../../environment";
import { clearAllDataFromStorage } from "../../utils/utility";


const LandingPage = () => {
  const navigate = useNavigate();
  const openWorkspace = () => {
    if (DEMO_MODE) {
      navigate("/home");
      return;
    }
    clearAllDataFromStorage();
    window.open(FALCON_LOGIN_URL_CODE, "_self");
  };

  // Only for Login Page
  useEffect(() => {
    let rootElement = document.getElementsByClassName("root");
    if (rootElement) {
      rootElement[0].style.backgroundColor = "#CBD5E1";
    }
    let mainContainer = document.getElementsByClassName("main-container");
    if (mainContainer) {
      mainContainer[0].style.marginTop = "0px";
    }
  }, []);


  return (
    <div className={classes.root}>
      <Box className={classes.partFull}>
        <div className={classes.partA}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent={"space-evenly"} height={"100%"} p={4}>
            <Box mb={0} display="flex" flexDirection="column" alignItems="center">
              <BrandMark size={200} style={{ marginTop: "-60px" }} />
            </Box>
          </Box>
        </div>
        <div>
          <Box
            display="flex"
            flexDirection="column"
            paddingLeft="30px"
            justifyContent="flex-start"
            alignItems="flex-start"
            backgroundColor="white"
            height="100%"
          >
            <Typography
              fontWeight="bold"
              textAlign="left"
              lineHeight="40px !important"
              fontSize="35px"
            >
              <br></br>
              <br></br>
              I Link <br></br>{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, blue, lightblue)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Automation Tool
              </span>{" "}
            </Typography>
            <Typography
              fontFamily="Inter, sans-serif"
              fontWeight="400"
              fontSize="16px"
              lineHeight="24px"
              width="60%"
              mb={5}
            >
              {" "}
              Create, organize, and review automated test suites with a streamlined quality workflow.
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              marginBottom="0px !important"
            >
              Explore the local demo workspace
            </Typography>

            <Box display="flex" justifyContent="center" gap={2} mt={2} mb={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={openWorkspace}
                className={classes.loginButton}
              >
                Open workspace
              </Button>
            </Box>
          </Box>
        </div>
      </Box>
    </div>
  );
};

export default LandingPage;
