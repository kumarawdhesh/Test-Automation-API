import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOrgAppDetails } from "../../store/dataSlice";
import { useLocation } from "react-router-dom";
import BreadcrumbComponent from "../../components/BreadcrumbComponent/BreadcrumbComponent";


const DomainAndSubdomainSelection = ({selectedOrgApplications, setSelectedOrgApplications}) => {
    const dispatch = useDispatch();
    const location = useLocation();

    const { selectedOrgAppDetails, getUserAccessInfo } = useSelector((state) => state?.data);

    useEffect(() => {
        if (selectedOrgAppDetails.orgName && selectedOrgApplications?.length == 0) {
            const applicationToShow = getUserAccessInfo?.organizations?.find((org) => org.name === selectedOrgAppDetails.orgName);
            setSelectedOrgApplications(applicationToShow?.applications);
        }
    }, [sessionStorage]);

    useEffect(() => {
        const organization = localStorage.getItem("organization");
        const application = localStorage.getItem("application");
        const orgObj = organization ? JSON.parse(organization) : null;
        const appObj = application ? JSON.parse(application) : null;

        const tempObj = {};

        if (orgObj) {
        tempObj.orgName = orgObj.orgName;
            setSelectedOrgApplications(getUserAccessInfo?.organizations?.find(orgs => orgs.name === orgObj.orgName).applications);
        }

        if (appObj) {
            tempObj.appName = appObj.appName
        }

        if (tempObj.orgName || tempObj.appName) {
            dispatch(setSelectedOrgAppDetails(tempObj));
        }
    }, [dispatch, getUserAccessInfo]);

    const handleorganizationChange = (event) => {
        const selectedOrg = event.target.value

        if (selectedOrg) {
            // dispatch(setMdtData({ application: "" }));
            setSelectedOrgApplications(getUserAccessInfo?.organizations.find(orgs => orgs.name === selectedOrg).applications);
            dispatch(
                setSelectedOrgAppDetails({
                    orgName: selectedOrg,
                    appName: "",
                })
            );
            // dispatch(setMdtData({ organization: selectedOrg }));
            localStorage.setItem("organization", JSON.stringify({orgName: selectedOrg}));
            localStorage.removeItem("application");
        }
    };

    const handleApplicationChange = (event) => {
    const selectedApp = event.target.value

    if (selectedApp) {
        dispatch(
        setSelectedOrgAppDetails({
            ...selectedOrgAppDetails,
            appName: selectedApp,
        })
        );
        // dispatch(setMdtData({ application: event.target.value }));
        localStorage.setItem(
        "application",
        JSON.stringify({
            appName: selectedApp,
        })
        );
    }
    };
    
    return (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          {/* Breadcrumb */}
          {/* <BreadcrumbComponent /> */}

          {/* Dropdowns Container */}
          <Box sx={{ display: "flex"}}>
            {/* Organization Select */}
            <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 150, marginRight: '10px' }}>
              <InputLabel id="org-select-label">
                Domain <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                labelId="org-select-label"
                value={selectedOrgAppDetails.orgName || ""}
                onChange={handleorganizationChange}
                label="Domain *"
                disabled={location.pathname !== "/home"}
              >
                {(getUserAccessInfo?.organizations || []).map((org) => (
                  <MenuItem key={org.name} value={org.name}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Application Select */}
            <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="app-select-label">
                Sub Domain <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                labelId="app-select-label"
                value={selectedOrgAppDetails.appName || ""}
                onChange={handleApplicationChange}
                label="Sub Domain *"
                disabled={location.pathname !== "/home"}

              >
                {(selectedOrgApplications || []).map((app) => (
                  <MenuItem key={app.name} value={app.name}>
                    {app.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
    );
}

export default DomainAndSubdomainSelection;