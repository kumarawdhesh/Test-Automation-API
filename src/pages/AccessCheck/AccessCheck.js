import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserAccessData from "./../../hooks/useUserAccessData";
import { useSelector, useDispatch } from "react-redux";
import { storeDataInStorage } from "../../utils/utility";
import { accessUpdate, setCredentials } from "./../../store/authSlice";
import * as classes from "./AccessCheck.module.css";
import { showLoading, closeLoading, showSnackbar } from "./../../store/appSlice";
import { Typography, Container } from "@mui/material";
import { setUserAccessInfo } from "../../store/dataSlice";

function AccessCheck() {
  const [accessMessageDisplay, setAccessMessageDisplay] = useState(false);

  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { fetchData } = useUserAccessData();

  const location = useLocation();

  const isLoading = useSelector((store) => store.app.isLoading);

  useEffect(() => {
    const fetchDataAndRedirect = async () => {
      try {
        dispatch(showLoading());
        const username = sessionStorage.getItem("username");

        const requestData = await fetchData(username);

        if(requestData.data.statusCode !== 200) {
          dispatch(showSnackbar({
            message: requestData.data.message || "You don't have access to this application.",
            className: "color-error-background",
          }));

          navigate("/login");

        } else if (requestData != null) {
          let firstName = requestData?.data?.body?.userFirstName;
          let lastName = requestData?.data?.body?.userLastName;
          let username = requestData?.data?.body?.userEmail;
          let full_name = firstName + " " + lastName;
          let irisVersions = requestData?.data?.body?.iris_versions;
          let multiStepAppDetails = requestData?.data?.body?.multi_step_app_details;

          // storeDataInStorage("access", requestData?.data?.body?.access);
          storeDataInStorage("first_name", firstName);
          storeDataInStorage("last_name", lastName);
          storeDataInStorage("username", username);
          storeDataInStorage("full_name", full_name);
          storeDataInStorage("iris_versions", JSON.stringify(irisVersions));
          storeDataInStorage("multi_step_app_details", JSON.stringify(multiStepAppDetails));

          let user = {
            // access: requestData?.data?.body?.access,
            first_name: firstName,
            last_name: lastName,
            full_name: full_name,  
            username,
          };
          dispatch(accessUpdate({ user: user }));
          dispatch(setCredentials({ user: user }));

          const rawDomainAndSubdomain = requestData?.data?.body?.org_app_data;
          const domainMaster = [];

          for (let domain in rawDomainAndSubdomain) {
            domainMaster.push({
              name: domain,
              applications: rawDomainAndSubdomain[domain].map(app => ({
                name: app.subdomainName,
                privileges: app.privileges,
              })),
            })
          }

          dispatch(setUserAccessInfo({ organizations: domainMaster }));
          storeDataInStorage(
            "userAccessInfo",
            JSON.stringify({ organizations: domainMaster })
          );
          
          // if (requestData?.data?.body?.access && requestData?.data?.body?.access !== "") {

          // }
          dispatch(closeLoading());
          
          if(location.search && location.search.endsWith("app=falcon")) {
            navigate("/home");
          } else if(location.search && location.search.endsWith("app=falcon-lite")) {
            navigate("/falcon-lite/nexus");
          }
        }
        dispatch(closeLoading());
        setAccessMessageDisplay(true);
      } catch (err) {
        // Handle error here
        dispatch(closeLoading());
        setAccessMessageDisplay(true);
        console.error("Error:", err);
      }
    };

    fetchDataAndRedirect();
    dispatch(
      showSnackbar({
        message: "Login Successful",
        className: "color-success-background",
      })
    );
  
  }, []);

  return (
    !isLoading && accessMessageDisplay && (
      <Container className={classes.container}>
        {/* Title */}
        <Typography variant="h1" align="center" gutterBottom>
          Hello User,
        </Typography>

        {/* Heading */}
          <Typography variant="h4" align="center" gutterBottom>
            I Link Automation Tool
        </Typography>

        {/* Subheading */}
        <Typography variant="h5" align="center" gutterBottom>
          Sorry, it seems you don't have the necessary access permissions to
          view this app.
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          You can reach out to application support team. Our team will be happy
          to assist you in gaining the access you need.
        </Typography>
      </Container>
    )
  );
}

export default AccessCheck;
