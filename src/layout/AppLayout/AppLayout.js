import React, { useEffect } from "react";
import Header from "../../components/Header/Header";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../../components/Footer/Footer";
import * as classes from "./AppLayout.module.css";
import Container from "@mui/material/Container";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";
import Loader from "../../components/Loader/Loader";
import SnackbarNotification from "../../components/SnackbarNotification/SnackbarNotification";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import SubHeader from "../../components/SubHeader/SubHeader";
import { setSelectedReleaseId, setSelectedTestcycleId } from "../../store/dataSlice";
import { setUserAccessInfo } from "../../store/dataSlice";
import { setSelectedOrgAppDetails } from "../../store/dataSlice";
import { getDataFromStorage } from "../../utils/utility";
import demoData from "../../assets/json/demo-data.json";
import { DEMO_MODE } from "../../../environment";

const AppLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const userData = useSelector((state) => state.auth.user);
  const isSignedIn = userData && userData.username && userData.username.trim() !== "";

  const { isSidebarOpen, isLoading } = useSelector((store) => store.app);

  const testcyclename = location.state?.testCycleData?.test_cycle_name;
  const path = testcyclename ? testcyclename.replaceAll(" ", "_") : "";

  const chatAreaStyle = {
    marginLeft: isSignedIn ? isSidebarOpen ? "240px" : "60px" : undefined,
    transition: "margin 0.3s",
    margin: "0 !important",
    overflowX: "hidden",
    height: "100%",
  };

  useEffect(() => {
    const TESTCYCLE_DETAILS_PATH = `/testcycle-details/${path}`;
    const RELEASES_TESTCYCLE_PATH = "/releases-testcycle";

    const isTestCycleDetails = path && location.pathname === TESTCYCLE_DETAILS_PATH;
    const isReleasesTestcycle = location.pathname === RELEASES_TESTCYCLE_PATH;

    if (!isTestCycleDetails && !isReleasesTestcycle) {
      dispatch(setSelectedReleaseId(""));
      dispatch(setSelectedTestcycleId(""));
    }
  }, [location.pathname, path, dispatch]);

  useEffect(() => {
    if (DEMO_MODE) {
      const demoAccess = demoData.access.body;
      dispatch(setUserAccessInfo(demoAccess));
      sessionStorage.setItem("userAccessInfo", JSON.stringify(demoAccess));

      const savedOrganization = localStorage.getItem("organization");
      const savedApplication = localStorage.getItem("application");
      const organization = savedOrganization ? JSON.parse(savedOrganization).orgName : demoAccess.organizations[0].name;
      const applications = demoAccess.organizations.find((item) => item.name === organization)?.applications || [];
      const application = savedApplication ? JSON.parse(savedApplication).appName : applications[0]?.name;

      if (organization && application) {
        localStorage.setItem("organization", JSON.stringify({ orgName: organization }));
        localStorage.setItem("application", JSON.stringify({ appName: application }));
        dispatch(setSelectedOrgAppDetails({ orgName: organization, appName: application }));
      }
      return;
    }

    const storedUserAccessInfo = getDataFromStorage("userAccessInfo");
    
    if (storedUserAccessInfo) {
      const parsedUserAccessInfo = JSON.parse(storedUserAccessInfo);
      dispatch(setUserAccessInfo(parsedUserAccessInfo));
    }
  }, [dispatch]);

  return (
    <div className={classes["app-main"]}>
     
      {isSignedIn ? <Header isSidebarOpen={isSidebarOpen}/> : null}
     

      <Container disableGutters={true} maxWidth={false} component="main" className={classes.content}>
        {isSignedIn ? <Sidebar isOpen={isSidebarOpen} /> : null}
        <Loader open={isLoading} />
        <SnackbarNotification />
        <ConfirmDialog />
        <Box style={chatAreaStyle} className="main-container">
          <div style={{ marginTop: 30 }}>
            {isSignedIn && !["/admin-console", "/home"].includes(location.pathname) && <SubHeader />}
            <div style={{marginLeft: "20px", marginTop: location.pathname === "/home" ? "0px" : "80px", marginRight: "20px"}}>
              <Outlet />
            </div>
          </div>
        </Box>
      </Container>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AppLayout;
