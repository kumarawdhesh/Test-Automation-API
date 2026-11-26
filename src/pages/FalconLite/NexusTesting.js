import { Box, Container, FormControl, InputLabel, MenuItem, Select, Tabs, Tab } from "@mui/material";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import Testcase from "./Testcase";
import ExecutionHistory from "./ExecutionHistory";
import Loader from "../../components/Loader/Loader";
import SnackbarNotification from "../../components/SnackbarNotification/SnackbarNotification";
import { useDispatch, useSelector } from "react-redux";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { FALCON_API } from "../../../environment";
import { getDataFromStorage } from "../../utils/utility";
import { useGetIrisDomainListMutation } from "../../store/mdtSlice";
import { redirectToLogin } from "../../store/apiSlice";

function a11yProps(index) {
  return {
    id: `nexus-tab-${index}`,
    "aria-controls": `nexus-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nexus-tabpanel-${index}`}
      aria-labelledby={`nexus-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function NexusTesting() {
  const dispatch = useDispatch();

  const [tab, setTab] = useState(0);
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [openCycleModal, setOpenCycleModal] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editTestCase, setEditTestCase] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTestCase, setDeleteTestCase] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");

  const [testCases, setTestCases] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);

  const { isLoading } = useSelector((store) => store.app);
  const [getIrisDomainList] = useGetIrisDomainListMutation();

  useEffect(() => {
    if (selectedDomain !== "") {
      fetchTCsAndExecutionHistory(selectedDomain)
    }
  }, [selectedDomain, dispatch]);

  const fetchTCsAndExecutionHistory = async (domain) => {
    dispatch(showLoading(true));
    const fetchTestCases = fetch(`${FALCON_API}/falcon-lite`, {
        method: "POST",
        body: JSON.stringify({
          function_name: "get-nexus-test-cases",
          user_id: sessionStorage.getItem("username"),
          domain_name: domain,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getDataFromStorage("token")}`,
          IdentityProvider: "aws_cognito",
          ApplicationName: "falcon",
        },
      })
        .then((response) => {			
          if (response.status === 401) {
            dispatch(closeLoading());
            // Unauthorized, redirect to login
            redirectToLogin();
            return;
          }
          return response.json();
        })
        .then((response) => {
          if (response && response.body && response.statusCode === 200) {
            setTestCases(response.body.data);
          } else {
            setTestCases([]);
            dispatch(showSnackbar({
              message: response?.message || "Failed to fetch test cases",
              className: "color-error-background width-50",
            }));
            console.error("Failed to fetch test cases:", response);
          }
        })
        .catch((error) => {
          setTestCases([]);
          dispatch(showSnackbar({
            message: "Error fetching test cases",
            className: "color-error-background width-50",
          }));
          console.error("Error fetching Nexus Test cases:", error);
        });

    const fetchHistory = fetch(`${FALCON_API}/falcon-lite`, {
      method: "POST",
      body: JSON.stringify({
        function_name: "get-nexus-cycle-executions",
        user_id: sessionStorage.getItem("username"),
        domain_name: domain,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getDataFromStorage("token")}`,
        IdentityProvider: "aws_cognito",
        ApplicationName: "falcon",
      },
      })
        .then((response) => {			
          if (response.status === 401) {
            dispatch(closeLoading());
            // Unauthorized, redirect to login
            redirectToLogin();
            return;
          }
          return response.json();
        })
        .then((response) => {
          if (response && response.data && response.statusCode === 200) {
            setExecutionHistory(response.data?.test_cycle_executions);
          } else {
            setExecutionHistory([]);
            dispatch(showSnackbar({
              message: response?.message || "Failed to fetch execution history",
              className: "color-error-background width-50",
            }));
            console.error("Failed to fetch execution history:", response);
          }
        })
        .catch((error) => {
          setExecutionHistory([]);
          dispatch(showSnackbar({
            message: "Error fetching execution history",
            className: "color-error-background width-50",
          }));
          console.error("Error fetching execution history:", error);
        });

    Promise.all([fetchTestCases, fetchHistory]).finally(() => {
      dispatch(closeLoading());
    });
  }

  const fetchNexusDomains = async () => {
    try {
      dispatch(showLoading(true));
      const { data: response, error } = await getIrisDomainList({
        function_name: "get-nexus-domains",
        user_id: sessionStorage.getItem("username"),
      })
      dispatch(closeLoading());
      if (response && response.body && response.statusCode === 200) {  
        setDomains(response.body)
        if(response.body.length === 1) {
          setSelectedDomain(response.body[0].domain_name);
        }
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching Nexus domains:", error);
    }
  }

  useEffect(() => {
    fetchNexusDomains();
  }, []);
  

  // Get unique domains by domain_name
  const uniqueDomains = Array.from(
    new Map(domains.map(domain => [domain.domain_name, domain])).values()
  );

  return (
    <div>
      <header>
        <Header isSidebarOpen={false} isFalconLiteHeader={true}/>
      </header>

      <Loader open={isLoading} />
      <SnackbarNotification />

      <Container disableGutters={true} maxWidth={false} component="main" style={{ marginTop: "64px", padding: "20px" }}>
        <Box>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <FormControl size="small" variant="outlined">
                <InputLabel id="suite-label">Select Domain</InputLabel>
                <Select
                    labelId="suite-label"
                    value={selectedDomain}
                    label="Select Domain"
                    sx={{ minWidth: 180 }}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                >
                    {uniqueDomains.map((domain) => (
                        <MenuItem key={domain.domain_name} value={domain.domain_name}>
                            {domain.domain_name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
          </div>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Nexus Tabs">
            <Tab label="Test Cases" {...a11yProps(0)} />
            <Tab label="Execution History" {...a11yProps(1)} />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Testcase 
              testCases={testCases}
              selectedTestCases={selectedTestCases}
              domains={domains}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              setSelectedTestCases={setSelectedTestCases}
              openCycleModal={openCycleModal}
              setOpenCycleModal={setOpenCycleModal}
              cycleName={cycleName}
              setCycleName={setCycleName}
              openEditModal={openEditModal}
              setOpenEditModal={setOpenEditModal}
              editTestCase={editTestCase}
              setEditTestCase={setEditTestCase}
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              deleteTestCase={deleteTestCase}
              setDeleteTestCase={setDeleteTestCase}
              openDeleteConfirm={openDeleteConfirm}
              setOpenDeleteConfirm={setOpenDeleteConfirm}
              fetchTCsAndExecutionHistory={fetchTCsAndExecutionHistory}
            />  
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <ExecutionHistory 
              executionHistory={executionHistory}
              selectedDomain={selectedDomain}
              fetchTCsAndExecutionHistory={fetchTCsAndExecutionHistory}
            />
          </TabPanel>
        </Box>
      </Container>
    </div>
  );
}

export default NexusTesting;