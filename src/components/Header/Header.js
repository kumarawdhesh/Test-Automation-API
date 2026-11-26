import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useDispatch, useSelector } from "react-redux";
import { clearAllDataFromStorage, isUserAuthenticated } from "../../utils/utility";
import AvatarLetter from "../AvatarLetter/AvatarLetter";
import { Box, IconButton, Typography, Menu, MenuItem, Button } from "@mui/material";
import { toggleMenu } from "../../store/appSlice";
import BrandMark from "../BrandMark/BrandMark";
import DomainAndSubdomainSelection from "../../pages/Home/DomainAndSubdomainSelection";
import { drawerWidth } from "../Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "../../store/authSlice";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { Launch } from "@mui/icons-material";
import { DEMO_MODE, REDIRECT_URL } from "../../../environment";

const Header = ({isSidebarOpen, isFalconLiteHeader}) => {
  const isSignedIn = isUserAuthenticated();
  const navigate = useNavigate();

  const [selectedOrgApplications, setSelectedOrgApplications] = useState([]);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);

  const data = useSelector((state) => state.auth.user);
  const { selectedOrgAppDetails } = useSelector((state) => state?.data);
  const dispatch = useDispatch();

  const handleSignOut = () => {    
    clearAllDataFromStorage();
    dispatch(clearCredentials());
    navigate("/landing-Page");
  };

  const handleAvatarClick = (event) => {
    setAvatarMenuAnchor(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer - 1,
        backgroundColor: "white",
        width: "100%",
        height: "64px !important",
      }}
    >
      <Toolbar disableGutters>
        <div style={{ flexGrow: 1 }}>
          {isFalconLiteHeader ? <div style={{ display: "flex", alignItems: "center"}} >
              <BrandMark
                size={44}
                onClick={() => {dispatch(toggleMenu())}}
                style={{
                  margin: "10px 10px 10px 10px",
                  cursor: "pointer",
                }}
              />
            </div>
            : null
          }
          <Box sx={{ml: `${isSidebarOpen ? drawerWidth : "64"}px`}}>
            {!isFalconLiteHeader && <DomainAndSubdomainSelection selectedOrgApplications={selectedOrgApplications} setSelectedOrgApplications={setSelectedOrgApplications}/>}
          </Box>
        </div>

        {isFalconLiteHeader && <Button
          variant="text"
          onClick={() => {
            if (DEMO_MODE) {
              navigate("/home");
            } else {
              window.open(REDIRECT_URL, "_blank");
            }
          }}
          sx={{
            marginRight: 2,
          }}
          endIcon={
            <Launch />
          }
        >
          I Link Workspace
        </Button>}

        {isSignedIn && data.full_name !== "" && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 20 }}>
            <Typography variant="body2" style={{ marginBottom: 2 }}>
              <b>{data?.full_name}</b>
            </Typography>
            {selectedOrgAppDetails.appName && (
              <Typography
                variant="h6"
                sx={{ marginLeft: "2px", marginTop: "2px", fontSize: "10px" }}
              >
                Domain Access:{" "}
                {
                  selectedOrgApplications.find(
                    (apps) => apps.name === selectedOrgAppDetails.appName
                  )?.privileges
                }
              </Typography>
            )}
          </div>
        )}

        {isSignedIn && data.full_name !== "" && (
          <div style={{ marginRight: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box>
                <IconButton
                  onClick={handleAvatarClick}
                  style={{ padding: 0, color: "black" }}
                >
                  <AvatarLetter
                    fullName={data?.full_name}
                    displayToolTip={true}
                    sx={{ cursor: "pointer" }}
                  />
                </IconButton>
              <Menu
                anchorEl={avatarMenuAnchor}
                open={Boolean(avatarMenuAnchor)}
                onClose={handleAvatarMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleAvatarMenuClose}>
                  <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleAvatarMenuClose}>
                  <HelpOutlineIcon sx={{ mr: 1 }} fontSize="small" />
                  Help Page
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleAvatarMenuClose();
                    handleSignOut();
                  }}
                  sx={{ color: "red" }}
                >
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};
export default Header;
