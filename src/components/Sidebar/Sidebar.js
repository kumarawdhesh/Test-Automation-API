import { Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import * as classes from "./Sidebar.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import DrawerHeader from "../DrawerHeader/DrawerHeader";
import { useSelector, useDispatch } from "react-redux";
import { showSnackbar, toggleMenu } from "../../store/appSlice";
import { clearAllDataFromStorage, getDataFromStorage, isUserAuthenticated } from "../../utils/utility";
import { clearCredentials } from "../../store/authSlice";
import { History, Home, KeyboardDoubleArrowLeft, Launch, Menu, NewReleases, Summarize, Timer, Work, Tty, CreateNewFolder } from "@mui/icons-material";
import { CREATORS, DEMO_MODE, FALCON_LITE_LOGIN_URL_CODE } from "../../../environment";
import BrandMark from "../BrandMark/BrandMark";
import jaasIcon from '../../assets/image/jaas-r.png';
import cycleIcon from '../../assets/image/cycle.png';

export const drawerWidth = 240;

const Sidebar = ({ isOpen }) => {
  const { selectedOrgAppDetails } = useSelector((state) => state?.data);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const { pathname } = useLocation();
  const isSignedIn = isUserAuthenticated();
  const userMail = getDataFromStorage("username");

  const handlePathChange = (path) => {
    if (selectedOrgAppDetails.orgName && selectedOrgAppDetails.appName) {
      navigate(`/${path}`);
    } else {
      dispatch(
        showSnackbar({
          message: " Please select domain & sub domain to proceed!",
          className: "color-error-background width-50",
        })
      );
    }
  };

  const isPathActive = (path) => {
    return pathname === `/${path}`;
  };

  const handleSignOut = (event) => {
    clearAllDataFromStorage();
    dispatch(clearCredentials());
    // localStorage.clear();\
    navigate("/landing-Page");
  };

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          overflowX: 'hidden',
          "& .MuiDrawer-paper": {
            width: isOpen ? drawerWidth : "65px",
            backgroundColor: "#ffffff",
            color: "#000000",
            '& .MuiListItemIcon-root': {
              color: 'black',
            },
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between', // Add this line
          }
        }}
        PaperProps={{}}
        open={true}
      >
        <div className={classes["sidebar-container"]}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BrandMark
              size={44}
              onClick={() => { dispatch(toggleMenu()) }}
              style={{
                margin: "10px 10px 10px 10px",
                cursor: "pointer",
              }}
            />
            <IconButton
              onClick={() => {
                dispatch(toggleMenu());
              }}
              style={{ margin: "10px 10px 10px 0px" }}
            >
              {isOpen && (
                <KeyboardDoubleArrowLeft fontSize="small" />
              )}
            </IconButton>
          </div>
          {isSignedIn && (
            <div className={classes["scrollable-content"]}>
              <List >
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("home")} className={`${isPathActive("home") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <Home />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Home" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("testsuite-history")} className={`${isPathActive("testsuite-history") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Test Suite & Cases" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("testcase-generation")} className={`${isPathActive("testcase-generation") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <CreateNewFolder />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Generate Test Cases" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("releases-testcycle")} className={`${isPathActive("releases-testcycle") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <img src={cycleIcon} alt="Release & Test Cycles" style={{ width: "24px", height: "24px" }} />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Release & Test Cycles" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("schedule")} className={`${isPathActive("schedule") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <Timer />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Test Schedules" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("execution-history")} className={`${isPathActive("execution-history") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <History />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Execution History" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("view-jaas-issues")} className={`${isPathActive("view-jaas-issues") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <img src={jaasIcon} alt="Jaaz Issues" style={{ width: "24px", height: "24px" }} />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Jaas Issues" /> : null}
                  </ListItemButton>
                </ListItem>
                <ListItem style={{ padding: "0px", height: "60px" }} button="true" onClick={() => handlePathChange("reports")} className={`${isPathActive("reports") ? classes.selected : classes.sideMenu}`}>
                  <ListItemButton>
                    <ListItemIcon>
                      <Summarize />
                    </ListItemIcon>
                    {isOpen ? <ListItemText primary="Reports" /> : null}
                  </ListItemButton>
                </ListItem>
                {(CREATORS.includes(userMail) || DEMO_MODE) && (
                  <ListItem style={{ padding: "0px", height: "60px", borderTop: "1px dotted grey" }} button="true" onClick={() => DEMO_MODE ? navigate("/falcon-lite/nexus") : window.open(FALCON_LITE_LOGIN_URL_CODE, "_blank")} className={classes.sideMenu}>
                    <ListItemButton>
                      <ListItemIcon>
                        <BrandMark size={24} />
                      </ListItemIcon>
                      {isOpen ? <ListItemText primary={<>I Link Nexus</>} /> : null}
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </div>
          )}
          {/* <List>
            {isSignedIn && (
              <ListItem style={{ marginLeft: "0px" }} button="true" onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {isOpen ? <ListItemText primary="Logout" /> : null}
              </ListItem>
            )}
          </List> */}
          <DrawerHeader />
        </div>
      </Drawer>
    </>
  );
};

export default Sidebar;
