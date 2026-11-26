import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionSummary, AccordionDetails, Box, Button, Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, InputAdornment, InputLabel, ListSubheader, Menu, MenuItem, Modal, Paper, Radio, RadioGroup, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon, Launch, Add, AddCircle, Delete, ArrowUpward, ArrowDownward, ArrowBack } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetTestSuitMutation, useUpdateTestCaseMutation, useCreateNewTestCaseMutation, useGetIrisDomainListMutation, useCreateNewIrisTestCaseMutation, useUpdateIrisTestCaseMutation,useBulkUploadTestCasesMutation } from "../../store/mdtSlice";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import TestSuiteDialog from "../../components/TestSuiteDialog/TestSuiteDialog";
import * as classes from "./TestCase.module.css";
import { getDataFromStorage } from "../../utils/utility";
import ConfirmDialogWithReason from "./ConfirmDialogWithReason";
import { FALCON_API, FALCON_ENV, GUARDIAN_API } from "../../../environment";
import "./TestCase.module.css";
import { redirectToLogin } from "../../store/apiSlice";
import MultiStepModal from "./MultiStepModal";
import IrisTestCase from "../IrisTestCase/IrisTestCase";
import RenderMultiStepTable from "./RenderMultiStepTable";

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const TestCase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [testSuitInfo, setTestSuitInfo] = useState([]);
  const { selectedOrgAppDetails } = useSelector((state) => state.data);
  const [getConnectionDetailes, setConnectionDetailes] = useState([]);
  const [getDBDetailes, setDBDetailes] = useState([]);
  const [getTargetDBDetailes, setTargetDBDetailes] = useState([]);
  const [touchedForms, setTouchedForms] = useState([]);
  const [testSuiteDialogOpen, setTestSuiteDialogOpen] = useState(false);
  const { testCaseData, testCaseType, fileName } = location.state || {};
  const [testSuiteDetailes, setTestSuiteDetailes] = useState([
    {
      name: "",
      description: "",
    },
  ]);
  const initialState = {
    testSuiteId: { test_suite_name: "", test_suite_description: "" },
    testCaseName: "",
    testCaseDescription: "",
    testType: "",
    execution_engine: "",
    testScenario: "",
    sourceConnection: "",
    sourceDB: "",
    targetConnection: "",
    targetDB: "",
    sourceSQL: "",
    targetSQL: "",
    Nexus_Expected_SQL: "",
    keyColumns: "",
    test_type: [],
    databaseConnection: "",
    iteration: "",
    domain: "",
    Question_to_IRIS: "",
    Expected_SQL: "",
    iris_version: "",
    isSqlValid: false,
    isSourceSqlValid: false,
    isTargetSqlValid: false,
    source_file: "",
    target_file: "",
    isMultiStep: false,
    steps: [],
  };

  const [testcaseForms, setTestCaseForms] = useState([initialState]);
  // const [openGenerateSQLDialog, setOpenGenerateSQLDialog] = useState(false);
  // const [connectionDetails, setConnectionDetails] = useState([]);
  const [isRequired, setIsRequired] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [irisDomainList, setIrisDomainList] = useState([]);
  const [nexusDomains, setNexusDomains] = useState([]);
  const [searchTestSuite, setSearchTestSuite] = useState("");
  const [currentFormIndex, setCurrentFormIndex] = useState(null);
  const [testcaseType, setTestcaseType] = useState([]);
  const [openDoubleConfirm, setOpenDoubleConfirm] = useState(false);
  const [isAllSqlValidated, setIsAllSqlValidated] = useState(false);
  const [sourceS3Files, setSourceS3Files] = useState([]);
  const [targetS3Files, setTargetS3Files] = useState([]);
  const [openStepModal, setOpenStepModal] = useState(false);
  const [currentStepData, setCurrentStepData] = useState({ application: '', env: '', payloadType: 'json', payload: '', formData: [{ key: '', value: '' }] });
  const [testCaseFormIndexForStepModal, setTestCaseFormIndexForStepModal] = useState(null);
  const [editingStepId, setEditingStepId] = useState(null); // id of step when editing
  const [stepExecutionType, setStepExecutionType] = useState("sync");

  const handleStepExecutionTypeChange = (event, formIndex) => {
    const { value } = event.target;
    setStepExecutionType(value);
  };

  const [getTestSuit] = useGetTestSuitMutation();
  const [updateTestCase] = useUpdateTestCaseMutation();
  const [createNewTestCase] = useCreateNewTestCaseMutation();
  const [getIrisDomainList] = useGetIrisDomainListMutation();
  const [createNewIrisTestCase] = useCreateNewIrisTestCaseMutation();
  const [updateIrisTestCase] = useUpdateIrisTestCaseMutation();
  const [bulkUploadTestCases] = useBulkUploadTestCasesMutation();

  const createTestsuiteOption = { id: -1, name: "Create Testsuite" };
  const containsText = (text, searchTestSuite) => text.toLowerCase().indexOf(searchTestSuite.toLowerCase()) > -1;

  useEffect(() => {
    fetchConnectionDetails();
    fetchTestSuitInfo();
    fetchNexusDomains()
  }, []);

  useEffect(() => {
    // If the location search has test_suite_id & test_suite_name then we will set the testSuiteId and testSuiteName in the testcaseForms (also check if testSuiteInfo is not empty)
    if (location.search && testSuitInfo.length > 0) {
      const urlParams = new URLSearchParams(location.search);
      const testSuiteId = urlParams.get("test_suite_id");
      const testSuiteName = urlParams.get("test_suite_name");
      if (testSuiteId && testSuiteName) {
        const updatedForms = [...testcaseForms];
        updatedForms[0] = {
          ...updatedForms[0],
          testSuiteId: {
            test_suite_name: testSuiteName,
            test_suite_description: "",
          },
        };
        setTestCaseForms(updatedForms);
        setTestSuiteDetailes({
          name: testSuiteName,
          description: "",
        });
        setSearchTestSuite(testSuiteName);
      }
    }
  }, [location, testSuitInfo]);

  //This useffect is to watch the changes in concerned fields and update isAllSqlValidated
  useEffect(() => {
    let enableSave = testcaseForms.every((testcaseForm) => {
      if(testcaseForm.execution_engine === "Iris"){
        return testcaseForm.isSqlValid
      } else if(testcaseForm.testType === "Data_Testing") {
        // For Data Testing, check both source and target validations
        
        // Validate source connection
        const isSourceValid = testcaseForm.sourceConnection === "File" 
          ? testcaseForm.source_file && testcaseForm.source_file !== ''
          : testcaseForm.isSourceSqlValid;
        
        // Validate target connection
        const isTargetValid = testcaseForm.targetConnection === "File"
          ? testcaseForm.target_file && testcaseForm.target_file !== ''
          : testcaseForm.isTargetSqlValid;

          console.log(testcaseForm, isSourceValid, testcaseForm.source_file, isTargetValid,  testcaseForm.target_file)
        return isSourceValid && isTargetValid;
      } else {
        return testcaseForm.isSourceSqlValid && testcaseForm.isTargetSqlValid
      }
    })
    setIsAllSqlValidated(enableSave)
  }, [testcaseForms])

  useEffect(() => {
    if (testCaseData) {
      if (testCaseType === "ExistingIrisTestCase") {
        try {
          let sourceSQLString = testCaseData.source_sql;
          let sourceSQLObject = JSON.parse(`${sourceSQLString}`);
          let testTypesArray = Array.isArray(sourceSQLObject.test_type)
            ? sourceSQLObject.test_type
            : sourceSQLObject.test_type.split(",").map((type) => type.trim());

          if (testCaseData.source_connection) {
            fetchDBDetails(
              testCaseData.source_connection,
              "sourceConnection",
              0,
              testCaseData.source_db
            );
            fetchDBDetails(
              testCaseData.source_connection,
              "targetConnection",
              0,
              testCaseData.source_db
            );
          }

          setTestCaseForms([{
              testSuiteId: testCaseData.test_suite_id,
              testCaseName: testCaseData.test_case_name,
              testCaseDescription: testCaseData.test_case_desc,
              sourceConnection: testCaseData.source_connection,
              sourceDB: testCaseData.source_db,
              targetDB: testCaseData.source_db,
              iteration: sourceSQLObject.iteration,
              domain: sourceSQLObject.data_domain,
              Question_to_IRIS: sourceSQLObject.question,
              iris_version: sourceSQLObject.iris_version,
              test_type: testTypesArray, //Accuracy, Similarity, etc
              Expected_SQL: testCaseData.target_sql,
              databaseConnection: "",
              test_case_id: testCaseData.test_case_id,
              testType: "NLQ_Testing",
              execution_engine: "Iris",
              testScenario: "",
              targetConnection: "",
              keyColumns: testCaseData.key_cols,
              sourceSQL: "",
              targetSQL: "",
              isSqlValid: true,
            },
          ]);

          fetchDBDetails("snowflake", "Accuracy", 0, testCaseData.source_db);
          fetchIrisDomainList();
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      } else if (testCaseType === "ExistingNormalTestCase") {		
        setTestCaseForms([
          {
            testSuiteId: testCaseData.test_suite_id,
            testCaseName: testCaseData.test_case_name,
            testCaseDescription: testCaseData.test_case_desc,
            testType: testCaseData.test_case_type,
            testScenario: testCaseData.test_scenario,
            sourceConnection: testCaseData.source_connection,
            sourceDB: testCaseData.source_db,
            targetConnection: testCaseData.target_connection,
            targetDB: testCaseData.target_db,
            sourceSQL: testCaseData.source_sql,
            targetSQL: testCaseData.target_sql,
            keyColumns: testCaseData.key_cols,
            test_case_id: testCaseData.test_case_id,
            isMultiStep: testCaseData.is_multi_step_enabled,
            steps: testCaseData?.steps?.length ? testCaseData.steps.map(s => ({
              ...s,
              id: s.multi_step_id,
              application: s.app_name,
              payloadType: s.payload_format,
              payload: s.payload_format === "json" ? JSON.stringify(s.request_payload) : "",
              formData: s.payload_format === "form-data" ? s.request_payload : [],
              sequence: s.seq_no,
            })) : [],
            isSourceSqlValid: true,
            isTargetSqlValid: true
          },
        ]);
        setStepExecutionType(testCaseData.multi_step_type);

        fetchDBDetails(
          testCaseData.source_connection,
          "sourceConnection",
          0,
          testCaseData.source_db
        );
        fetchDBDetails(
          testCaseData.target_connection,
          "targetConnection",
          0,
          testCaseData.target_db
        );
      } else if(testCaseType === "ExistingNexusTestCase"){
        let sourceSQLString = testCaseData.source_sql;
        let sourceSQLObject = JSON.parse(`${sourceSQLString}`);
        let testTypesArray = Array.isArray(sourceSQLObject.test_type)
          ? sourceSQLObject.test_type
          : sourceSQLObject.test_type.split(",").map((type) => type.trim());
        fetchDBDetails("Snowflake", "sourceConnection", 0, testCaseData.source_db);
        setTestCaseForms([
          {
            testSuiteId: testCaseData.test_suite_id,
            testCaseName: testCaseData.test_case_name,
            testCaseDescription: testCaseData.test_case_desc,
            sourceConnection: testCaseData.source_connection,
            // sourceDB: testCaseData.source_db,
            // targetDB: testCaseData.source_db,
            test_type: testTypesArray,
            Nexus_Expected_SQL: testCaseData.target_sql,
            databaseConnection: "",
            test_case_id: testCaseData.test_case_id,
            testType: "NLQ_Testing",
            execution_engine: "Nexus",
            testScenario: "",
            keyColumns: testCaseData.key_cols,
            sourceSQL: "",
            targetSQL: "",
            iteration: sourceSQLObject.iteration,
            domain: sourceSQLObject.data_domain,
            Question_to_Nexus: sourceSQLObject.question,
            iris_version: sourceSQLObject.iris_version,
            workspace: {
              workspace_id: sourceSQLObject.workspace_id,
              workspace_name: sourceSQLObject.workspace_name,
              domain_name: sourceSQLObject.workpsace_domain_name,
              created_by: sourceSQLObject.created_by,
              version_id: nexusDomains.length ? nexusDomains.find(nd => nd.workspace_id === sourceSQLObject.workspace_id)?.version_id : "",
              version_name: nexusDomains.length ? nexusDomains.find(nd => nd.workspace_id === sourceSQLObject.workspace_id)?.version_name : "",
              connection_id: nexusDomains.length ? nexusDomains.find(nd => nd.workspace_id === sourceSQLObject.workspace_id)?.connection_id : "",
              connection_name: nexusDomains.length ? nexusDomains.find(nd => nd.workspace_id === sourceSQLObject.workspace_id)?.connection_name : "",
            },
          },
        ]);
          
      } else if (testCaseType && testCaseType === "Bulk Upload") {
        const newForms = testCaseData.map((item) => ({
          ...initialState,
          testSuiteId: {
            test_suite_name: item.testSuiteName,
            test_suite_description: "",
          },
          testCaseName: item.testCaseName,
          testCaseDescription: item.testCaseDescription,
          sourceConnection: item.sourceConnectionType,
          iteration: item.iteration,
          domain: item.domain,
          test_type: item.test_type,
          Question_to_IRIS: item.Question_to_IRIS,
          Expected_SQL: item.Expected_SQL,
          iris_version: item.IrisVersion,
        }));

        setTestCaseForms(newForms);
        const newTestcaseTypes = newForms.map((form) =>
          form.sourceConnection === "Iris" ? "iris" : "normalTestcase"
        );
        setTestcaseType(newTestcaseTypes);
      }
    }
  }, [testCaseData, getConnectionDetailes, nexusDomains]);

  const fetchTestSuitInfo = async () => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getTestSuit({
        function_name: "get-test-suites",
        user_id: sessionStorage.getItem("username"),
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
      });

      if (response && response.body && response.statusCode === 200) {
        setTestSuitInfo(response?.body.test_suites);
        dispatch(closeLoading());
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching Test Suite info:", error);
    }
  };

  const fetchConnectionDetails = async () => {
    try {
      const token = getDataFromStorage("token");

      fetch(
        `${GUARDIAN_API}&domainName=${selectedOrgAppDetails.orgName}&subDomainName=${selectedOrgAppDetails.appName}`, 
        {
          method: "GET",
          headers: {
            Authorization: `${token}`,
            IdentityProvider: "aws_cognito"
          },
      }).then((response) => {			
        if (response.status === 401) {
          dispatch(closeLoading());
          // Unauthorized, redirect to login
          redirectToLogin();
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data.statusCode === 200) {
          setConnectionDetailes(data.connection_name);
        } else {
          dispatch(
            showSnackbar({
              message: `${data.error || "Error fetching connection details"}`,
              className: "color-error-background width-50",
            })
          );
        }
      }).catch(err => {
        console.log(err);
      });

    } catch (error) {
      console.error("Error fetching connection details:", error);
    }
  };

  const fetchNexusDomains = async () => {
    try {
      const { data: response, error } = await getIrisDomainList({
        function_name: "get-nexus-domains",
        user_id: sessionStorage.getItem("username"),
      })
      if (response && response.body && response.statusCode === 200) {
        setNexusDomains(response.body)
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching Nexus domains:", error);
    }
  }

  const accordion = (title, children) => {
    return (
      <Accordion defaultExpanded={true} sx={{ width: title === "Source and Target Queries" ? "95%" : "90%" }}>
        <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}>
          <Typography fontFamily={"Inter"}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    );
  };

  const displayedOptions = useMemo(() => {
    const filteredOptions = testSuitInfo.filter((option) => containsText(option?.name, searchTestSuite));
    if (!searchTestSuite) {
      return [testSuitInfo.find((option) => option?.name === "Default"), createTestsuiteOption];
    }
    return [...filteredOptions, createTestsuiteOption];
  }, [searchTestSuite, testSuitInfo]);

  const fetchDBDetails = async (connectionTypeName, name, index, dbName) => {
    for (const connectionName in getConnectionDetailes) {
      if (connectionName === connectionTypeName) {
        if(name === "sourceConnection" ){
          setDBDetailes((prevState) => {
            const newData = [...prevState];
            newData[index] = getConnectionDetailes[connectionName];
            return newData;
          });
          if(dbName) {
            setTestCaseForms((prevState) => {
              const newData = [...prevState];
              newData[index] = {
                ...newData[index],
                sourceDB: dbName
              };
              return newData;
            });
          }
        } else if(name === "targetConnection") {
          setTargetDBDetailes((prevState) => {
            const newData = [...prevState];
            newData[index] = getConnectionDetailes[connectionName];
            return newData;
          });
          if(dbName) {
            setTestCaseForms((prevState) => {
              const newData = [...prevState];
              newData[index] = {
                ...newData[index],
                targetDB: dbName
              };
              return newData;
            });
          }
        } 
        // else if(name === "Accuracy") {
        //   setConnectionDetailes((prevState) => {
        //     const newData = [...prevState];
        //     newData[index] = getConnectionDetailes[connectionName];
        //     return newData;
        //   });
        // }
      }
    }
  };

  const fetchIrisDomainList = async (iris_version) => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getIrisDomainList({
        function_name: "mdt-get-iris-response",
        event_type: "get_iris_data_domains",
        user_id: sessionStorage.getItem("username"),
        iris_version: iris_version,
      });
      if (response && response.body && response.statusCode === 200) {
        setIrisDomainList(response.body.domains_list);
        dispatch(closeLoading());
      } else if(response && response.statusCode !== 200){
        dispatch(closeLoading());
        dispatch(
          showSnackbar({
            message: "Error fetching IRIS domain list",
            className: "color-error-background width-50",
          })
        );
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching IRIS domain list:", error);
    }
  };

  // const addTestCaseForm = () => {
  //   const newFields = [...testcaseForms];
  //   const lastField = newFields[newFields.length - 1];
  //   const newForm = { ...initialState, testSuiteId: lastField.testSuiteId };
  //   newFields.push(newForm);
  //   setTestCaseForms(newFields);
  // };

  // const removeTestCaseForm = (index) => {
  //   const updatedFields = [...testcaseForms];
  //   updatedFields.splice(index, 1);
  //   setTestCaseForms(updatedFields);
  // };

  const resetTestCaseForm = (index) => {
    if (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase") {
      const data = [...testcaseForms];
      const { testType, testScenario, test_case_id, testCaseName } = data[index];
      data[index] = {
        ...initialState,
        testSuiteId: data[index].testSuiteId,
        testType,
        testScenario,
        test_case_id,
        testCaseName,
      };
      setTestCaseForms(data);
    } else {
      const data = [...testcaseForms];
      data[index] = initialState;
      setTestCaseForms(data);
    }
  };

  const saveTestSuite = () => {
    const newTestsuite = {
      id: testSuitInfo.length + 1,
      name: testSuiteDetailes.name,
      description: testSuiteDetailes.description,
    };

    const updatedOptions = [...testSuitInfo, newTestsuite];
    setTestSuitInfo(updatedOptions);

    const updatedForms = [...testcaseForms];
    updatedForms[currentFormIndex] = {
      ...updatedForms[currentFormIndex],
      testSuiteId: {
        test_suite_name: newTestsuite.name,
        test_suite_description: newTestsuite.description || "",
      },
    };
    setTestCaseForms(updatedForms);
    setTestSuiteDialogOpen(false);
    setTestSuiteDetailes({ name: "", description: "" });
    setTestSuiteDialogOpen(false);
  };

  const handleTestSuitValue = (field) => {
    if (typeof field.testSuiteId == "number") {
      return field.testSuiteId;
    } else {
      return field.testSuiteId?.test_suite_name;
    }
  };

  const handleClose = () => {
    setTestSuiteDialogOpen(false);
    setIsRequired(false);

    const updatedForms = [...testcaseForms];
    updatedForms[currentFormIndex] = {
      ...updatedForms[currentFormIndex],
      testSuiteId: 1,
    };
    setTestCaseForms(updatedForms);
  };

  const handleTestTypeChange = (event, index, type) => {
    const isChecked = event.target.checked;
    const newForms = [...testcaseForms];
    const currentTestTypes = newForms[index].test_type;

    if (isChecked && !currentTestTypes.includes(type)) {
      newForms[index].test_type = [...currentTestTypes, type];
    } else if (type !== "Accuracy") {
      newForms[index].test_type = currentTestTypes.filter((item) => item !== type);

      if (type === "Consistency") {
        newForms[index].iteration = "";
      } 
      // else if (type === "Accuracy") {
      //   newForms[index].databaseConnection = "";
      // }
    }
    const newSelected = newForms[index].test_type;
    if (newSelected.includes("Similarity with data") && newSelected.includes("Similarity")) {
      // fetchDBDetails("Snowflake", "Accuracy", index);
       newForms[index].test_type = newSelected.filter((item) => item !== "Similarity");

    }

    setTestCaseForms(newForms);
  };

  const handleDomainSelect = (domain, index) => {
    setTestCaseForms((prevState) => {
      const newData = [...prevState];
      newData[index] = {
        ...newData[index],
        domain: domain,
      };
      return newData;
    });
    setAnchorEl(null);
  };

  const handleWorkspaceSelect = (e, index) => {   
    const workspaceId = e.target.value;
    const workspace = nexusDomains.find((item) => item.workspace_id === workspaceId);
    
    setTestCaseForms((prevState) => {
      const newData = [...prevState];
      newData[index] = {
        ...newData[index],
        workspace: {...workspace},
      };
      return newData;
    });
    setAnchorEl(null);
  };

  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const token = getDataFromStorage("token");

    const newFields = [...testcaseForms];
    newFields[index] = {
      ...newFields[index],
      [name]: (name === "sourceSQL" || name === "targetSQL") ? value.replace(/\n/g, ' ') : value, 
    };
    
    if (name === "testType" && value === "NLQ_Testing") {
      newFields[index].test_type = ["Accuracy"];
      // Remove the hardcoded sourceConnection assignment
      // newFields[index].sourceConnection = "Snowflake";
      // fetchDBDetails("Snowflake", "sourceConnection", index);
    } else if(name === "testType" && value === "Data_Testing"){
      newFields[index].execution_engine = "";
    }

    if (name === "sourceConnection") {
      newFields[index].test_type = [];
      newFields[index].databaseConnection = "";
      newFields[index].iteration = "";
      newFields[index].domain = "";
      newFields[index].Question_to_IRIS = "";
      newFields[index].Expected_SQL = "";
      newFields[index].sourceDB = "";
      newFields[index].iris_version = "";

      const newTestcaseTypes = [...testcaseType];
      newTestcaseTypes[index] = value === "Iris" ? "iris" : "normalTestcase";
      setTestcaseType(newTestcaseTypes);
      
      // Fetch DB details for the selected connection (works for both Data_Testing and NLQ_Testing)
      fetchDBDetails(value, "sourceConnection", index);
    }

    // if (name === "sourceConnection" && value === "Iris") {
    //   newFields[index].test_type = ["Accuracy"];
    // }
    
    if (name === "iris_version") {
      newFields[index].domain = "";
      fetchIrisDomainList(newFields[index].iris_version);
    }
    
    // Here we are enabling the validate sql button if the user changes the sql or the related dropdowns.
    if((name === "Expected_SQL" || name === "sourceDB" || name === "Nexus_Expected_SQL") && newFields[index].isSqlValid) {
        newFields[index].isSqlValid = false
    }

    if((name === "sourceDB" || name === "sourceSQL") && newFields[index].isSourceSqlValid){
      newFields[index].isSourceSqlValid = false
    }

    if((name === "targetDB" || name === "targetSQL") && newFields[index].isTargetSqlValid){
      newFields[index].isTargetSqlValid = false
    }

    if((name === "sourceDB" || name === "targetDB") && value !== "" && newFields[index].sourceConnection === "s3"){
      const payload = {
        org_id: selectedOrgAppDetails.orgName,
        app_id: selectedOrgAppDetails.appName,
        env_name: "dev",
        conn_id: value
      }
      
      dispatch(showLoading())
      fetch(`${FALCON_API}/mdt-get-folders-files-path-from-s3`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      .then((data) => {
        
        dispatch(closeLoading());
        if (data.statusCode === 200) {
          if(name === "sourceDB"){
            setSourceS3Files(data.body)
          } else {
            setTargetS3Files(data.body)
          }
        } else  {
          dispatch(
            showSnackbar({
              message: "Error Fetching files, Try again later!",
              className: "color-error-background width-50",
            })
          );
        }
      }).catch((err) => {
        dispatch(closeLoading())
        console.log(err);
        dispatch(
          showSnackbar({
            message: "Error Fetching files, Try again later!",
            className: "color-error-background width-50",
          })
        );
      })
    }

    if (name === "isMultiStep") {
      newFields[index].isMultiStep = event.target.checked;
    }

    setTestCaseForms(newFields);
    if (name === "sourceConnection" || name === "targetConnection") {      
      fetchDBDetails(value, name, index);
    }
  };

const handleFileUpload = (event, index, fieldName) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const newFields = [...testcaseForms];
  
  if (fieldName === "source_file") {
    // Only store the file object, don't update source_file yet
    newFields[index].source_file_object = file;
  } else if (fieldName === "target_file") {
    // Only store the file object, don't update target_file yet
    newFields[index].target_file_object = file;
  }
  
  setTestCaseForms(newFields);
};

// Add this new handler function
const handleFileUploadToS3 = async (index, fieldName) => {
  try {
    const fileObj = fieldName === "source_file" 
      ? testcaseForms[index].source_file_object 
      : testcaseForms[index].target_file_object;

    if (!fileObj) {
      dispatch(showSnackbar({ message: "Please select a file first", className: "color-error-background width-50" }));
      return;
    }

    const token = getDataFromStorage("token");
    const fileExtension = fileObj.name.split('.').pop().toLowerCase();

    dispatch(showLoading());

    // Step 1: Get upload URL from backend
    const getUrlPayload = {
      function_name: "generate-file-upload-url",
      user_id: sessionStorage.getItem("username"),
      file_name: fileObj.name,
      file_type: fileExtension,
      file_size: fileObj.size,
      domain_name: selectedOrgAppDetails.orgName,
      sub_domain_name: selectedOrgAppDetails.appName,
    };

    const urlResponse = await fetch(`${FALCON_API}/test-case`, {
      method: "POST",
      body: JSON.stringify(getUrlPayload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (urlResponse.status === 401) {
      dispatch(closeLoading());
      redirectToLogin();
      return;
    }

    const urlData = await urlResponse.json();

    if (urlData.statusCode !== 200 || !urlData.body) {
      dispatch(closeLoading());
      dispatch(showSnackbar({ 
        message: urlData.error || "Failed to generate upload URL", 
        className: "color-error-background width-50" 
      }));
      return;
    }

    const uploadUrl = urlData.body.upload_url;
    const s3Uri = urlData.body.s3_uri;
    const presignedFields = urlData.body.fields; // S3 form fields

    // Step 2: Upload file to S3 using presigned URL
    const formData = new FormData();
    
    // Add all presigned fields
    if (presignedFields) {
      Object.keys(presignedFields).forEach(key => {
        formData.append(key, presignedFields[key]);
      });
    }

    // Add the file
    formData.append("file", fileObj);

    const s3Response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    dispatch(closeLoading());

    if (s3Response.status === 201 || s3Response.status === 204 || s3Response.ok) {
      dispatch(showSnackbar({ 
        message: "File uploaded successfully", 
        className: "color-success-background width-50" 
      }));

      // Update the form with the uploaded file path ONLY after successful upload
      const filePath = s3Uri || fileObj.name;
      const newFields = [...testcaseForms];
      
      if (fieldName === "source_file") {
        newFields[index].source_file = filePath;
        newFields[index].source_file_object = null; // Clear the object after successful upload
      } else if (fieldName === "target_file") {
        newFields[index].target_file = filePath;
        newFields[index].target_file_object = null; // Clear the object after successful upload
      }
      
      setTestCaseForms(newFields);
    } else {
      dispatch(showSnackbar({ 
        message: "Failed to upload file to S3", 
        className: "color-error-background width-50" 
      }));
    }
  } catch (error) {
    dispatch(closeLoading());
    console.error("Error uploading file:", error);
    dispatch(showSnackbar({ 
      message: "Error uploading file", 
      className: "color-error-background width-50" 
    }));
  }
};

  const saveTestCaseForm = async (modifyReason) => {
    try {
      let newTouchedForms = [];

      let invalidForms = false;
      testcaseForms.forEach((item, index) => {
        const isNLQTestCase = item.testType === "NLQ_Testing"; // NLQ Testing
        const isDataTesting = item.testType === "Data_Testing"; // Data Testing
        
        let missingFields;

        if (isNLQTestCase) {
          if (item.execution_engine === "Iris") {

            missingFields = (!item.testSuiteId
              || !item.testCaseName
              || (item.test_type.includes("Consistency") && !item.iteration)
              || !item.domain 
              || !item.Question_to_IRIS 
              || !item.Expected_SQL 
              || !item.sourceConnection 
              || item.test_type.length === 0 
              || !item.iris_version) 

          } else if (item.execution_engine === "Nexus") {
            missingFields = (!item.testSuiteId
              || !item.testCaseName
              || !item.sourceConnection
              || item.test_type.length === 0 ) 

            if (item.Nexus_Expected_SQL === "" && item.test_type.includes("Similarity")) {
              missingFields = true;
              dispatch(showSnackbar({ message: "Expected SQL is required when similarity is selected", className: "color-error-background" }));
            }
            if (item.workspace === undefined) {
              missingFields = true;
              dispatch(showSnackbar({ message: "Workspace Name  is required", className: "color-error-background" }));
            }
            if (item.Question_to_Nexus === "") {
              missingFields = true;
              dispatch(showSnackbar({ message: "Question is required", className: "color-error-background" }));
            }
            if (item.Nexus_Expected_SQL !== "" && item.isSqlValid === false) {
              missingFields = true;
              dispatch(showSnackbar({ message: "Please validate the SQL", className: "color-error-background" }));
            }
          } // End of NLQ Testing
         } else if (isDataTesting) { // Data Testing
          if (!item.isMultiStep) { // Single step data testing
              missingFields = (!item.testSuiteId 
                || !item.testCaseName
                || !item.testType
                || !item.sourceConnection
                || !item.sourceDB
                || !item.sourceSQL
                || !item.keyColumns
            // || (item.testType !== "Unary" && (!item.targetConnection || !item.targetDB)) 
            // || (item.testType !== "Unary" && !item.targetSQL)
            );
          } else { // Multi-step data testing
              missingFields = (!item.testSuiteId || !item.testCaseName || item.steps.length === 0);
          }
         }

        // if (missingFields) {
        //   newTouchedForms.push(index);
        //   invalidForms = true;
        // }
        
      });
      
      setTouchedForms(newTouchedForms);
      
      if (invalidForms) {
        return;
      } 
      
      dispatch(showLoading());
      const actions = [];
      
      const irisTestCases = testcaseForms.filter((item) => (item.execution_engine === "Iris"));
      const dataTestCases = testcaseForms.filter((item) => item.testType === "Data_Testing");
      const nexusTestCases = testcaseForms.filter((item) => item.execution_engine === "Nexus");

      const createDataPayload = testCases => ({
        test_cases: testCases.map((item) => {
          // Determine test mode and scenario based on connection types
          const isSourceFile = item.sourceConnection === "File";
          const isTargetFile = item.targetConnection === "File";
          const isFileVsTable = (isSourceFile && !isTargetFile) || (!isSourceFile && isTargetFile);
          const isFileVsFile = isSourceFile && isTargetFile;

          let testMode = "table_vs_table";
          let testScenario = "table_vs_table";

          if (isFileVsTable) {
            testMode = "file_vs_table";
            testScenario = "file_vs_table";
          } else if (isFileVsFile) {
            testMode = "file_vs_file";
            testScenario = "file_vs_file";
          }

          return {
            testSuiteId: item.testSuiteId,
            testCaseName: item.testCaseName,
            testCaseDescription: item.testCaseDescription,
            testType: "Data_Testing",
            
            sourceConnection: item.sourceConnection,
            sourceDB: isSourceFile ? "s3" : item.sourceDB,
            sourceSQL: isSourceFile ? item.source_file : item.sourceSQL,

            targetConnection: item.targetConnection,
            targetDB: isTargetFile ? "s3" : item.targetDB,
            targetSQL: isTargetFile ? item.target_file : item.targetSQL,
            
            keyColumns: item.keyColumns,
            domain_name: selectedOrgAppDetails.orgName,
            sub_domain_name: selectedOrgAppDetails.appName,
            is_multi_step_enabled: item.isMultiStep,
            multi_step_details: {
              multi_step_type: stepExecutionType,
              steps: item.steps.map(step => ({
                app_name: step.application,
                env: step.env,
                payload_format: step.payloadType,
                seq_no: step.sequence,
                request_payload: step.payloadType === 'json' ? JSON.parse(step.payload) : step.formData.reduce((acc, curr) => {
                  acc[curr.key] = curr.value;
                  return acc;
                }, {}),
              })),
            },
            ...(isFileVsTable || isFileVsFile) && {
              test_mode: testMode,
              testScenario: testScenario,
            },
            modify_reason: (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase") ? modifyReason : undefined,
            test_case_id: (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase") ? item.test_case_id : undefined,
          };
        }),
        user_id: sessionStorage.getItem("username"),
      });

      const createNexusPayload = testCases => ({
        test_cases: testCases.map((item) => ({
          testSuiteId: item.testSuiteId,
          testCaseName: item.testCaseName,
          testCaseDescription: item.testCaseDescription,
          testType: "NLQ_Testing",
          execution_engine: "Nexus",
          // sourceDB: item.sourceDB,
          sourceConnection: item.sourceConnection,
          keyColumns: item.keyColumns !== "" ? item.keyColumns : undefined,
          test_type: [...item.test_type],
          Expected_SQL: item.Nexus_Expected_SQL,
          // iteration: item.iteration,
          Question_to_Nexus: item.Question_to_Nexus ? item.Question_to_Nexus.replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/'/g, '\\\'')
            .replace(/"/g, '\\"') : "",
          domain_name: selectedOrgAppDetails.orgName,
          sub_domain_name: selectedOrgAppDetails.appName,
          workspace_id: item.workspace.workspace_id,
          workspace_name: item.workspace.workspace_name,
          workpsace_domain_name: item.workspace.domain_name,
          workpsace_created_by: item.workspace.created_by,
          connection_id: item.workspace.connection_id,
          connection_name: item.workspace.connection_name,
          modify_reason: (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase") ? modifyReason : undefined,
          test_case_id: (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase") ? item.test_case_id : undefined,
        })),
        user_id: sessionStorage.getItem("username"),
      })

      const createIrisPayload = testCases => ({
        test_cases: testCases.map((item) => ({
          testSuiteId: item.testSuiteId,
          testCaseName: item.testCaseName,
          testCaseDescription: item.testCaseDescription,
          testType: "NLQ_Testing",
          execution_engine: "Iris",
          iris_version: item.iris_version,
          Question_to_IRIS: item.Question_to_IRIS ? item.Question_to_IRIS.replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/'/g, '\\\'')
            .replace(/"/g, '\\"') : "",
          sourceConnection: item.sourceConnection,
          sourceDB: item.sourceDB,
          Expected_SQL: item.Expected_SQL,
          domain: item.domain,
          iteration: item.iteration !== "" ? item.iteration : undefined,
          test_type: item.test_type,
          keyColumns: item.keyColumns !== "" ? item.keyColumns : undefined,
          domain_name: selectedOrgAppDetails.orgName,
          sub_domain_name: selectedOrgAppDetails.appName,
          modify_reason: (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase") ? modifyReason : undefined,
          test_case_id: (testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase") ? item.test_case_id : undefined,
        })),
        user_id: sessionStorage.getItem("username"),
          
      })

      const irisTestCasePayload = createIrisPayload(irisTestCases);
      const dataTestCasePayload = createDataPayload(dataTestCases);
      const nexusTestCasePayload = createNexusPayload(nexusTestCases);
  
      if (testCaseType === "ExistingNormalTestCase") {
        if (dataTestCases.length > 0) {
          actions.push(updateTestCase({...dataTestCasePayload, function_name: "test-case-modify"}));
        }
      } else if (testCaseType === "ExistingIrisTestCase") {
        if (irisTestCases.length > 0) {
          actions.push(updateIrisTestCase({...irisTestCasePayload, function_name: "mdt-modify-iris-testcase"}));
        }
      } else if (testCaseType === "ExistingNexusTestCase") {
        if (nexusTestCases.length > 0) {
          actions.push(updateIrisTestCase({...nexusTestCasePayload, function_name: "modify-nexus-testcase"})); 
        }
      } else {
        if (irisTestCases.length > 0) {
          actions.push(createNewIrisTestCase({...irisTestCasePayload, function_name: "mdt-create-iris-testcase"}));
        }
        if (dataTestCases.length > 0) {
          actions.push(createNewTestCase({...dataTestCasePayload, function_name: "test-case-create"}));
        } 
        if(nexusTestCases.length > 0) {
          actions.push(createNewIrisTestCase({...nexusTestCasePayload, function_name: "create-nexus-testcase"})); // Here, we are using the same mutation as iris test case creation because of lambda grouping.
        }
      }
  
      if (testCaseType === "Bulk Upload") {
        try {
          const { data: response, error } = await bulkUploadTestCases(fileName);
          if (response && response.statusCode === 200) {
            navigate("/testsuite-history", {
              state: {
                fileName: fileName,
                testCaseType: "Bulk Upload",
              },
            });
            dispatch(
              showSnackbar({
                message: response.message,
                className: "color-success-background width-50",
              })
            );
          }
          if (error) {
            console.error("Error uploading test case:", error);
          }
        } catch (error) {
          console.error("Error uploading test case:", error);
        }
      }

      const results = await Promise.all(actions);

      results.forEach((result) => {
        const response = result.data || result.payload;
        const message = response?.message || "An error occurred";
        const className = response?.statusCode === 200 ? "color-success-background" : "color-error-background";
        dispatch(showSnackbar({ message, className }));
        if (response?.statusCode === 200) {
          navigate("/testsuite-history");
        }
      });

    } catch (error) {
      console.error("Error saving Test Case:", error);
      dispatch(showSnackbar({ message: "Error saving Test Case", className: "color-error-background" }));
    } finally {
      dispatch(closeLoading());
    }
  };

  const getHelperText = (index, field) => {
    if (touchedForms.includes(index) && !testcaseForms[index][field]) {
      return <span style={{ color: "red" }}>{`${field} should not be empty`}</span>;
    }
    if (field === "test_type" && touchedForms.includes(index) && testcaseForms[index].test_type.length === 0) {
      return <span style={{ color: "red" }}>Test type should not be empty</span>;
    }
    if (field === "Question_to_IRIS") {
      const questionIsEmpty = touchedForms.includes(index) && !testcaseForms[index].Question_to_IRIS;
      const domainIsNotSelected = touchedForms.includes(index) && !testcaseForms[index].domain;
      if (questionIsEmpty || domainIsNotSelected) {
        return (
          <span style={{ color: "red" }}>
            {questionIsEmpty ? "Question should not be empty. " : ""}
            {domainIsNotSelected ? "Domain should not be empty. " : ""}
          </span>
        );
      }
    }

    return "";
  };

  const onDoubleConfirm = (reason) => {
    setOpenDoubleConfirm(false);
    saveTestCaseForm(reason)
  }

  const onCancelDoubleConfirm = () => {
    setOpenDoubleConfirm(false);
  }

  // The value of type is locally defined to identify connection types
  // Possible values for type argument are Iris, normal_source & normal_target.
  const validateSqlHandler = (type, testcaseForm, index) => {
    const token = getDataFromStorage("token")

    let connectionType = "";
    let connectionName = "";
    let sql = "";
    
    if(type === "iris" || type === "normal_source" || type === "nexus"){
      connectionType = type !== "nexus" ? testcaseForm.sourceConnection : undefined;
      connectionName = type !== "nexus" ? testcaseForm.sourceDB : testcaseForm.workspace.connection_name;

      if(type === "iris"){
        sql = testcaseForm.Expected_SQL
      } else if(type === "nexus"){
        sql = testcaseForm.Nexus_Expected_SQL
      } else {
        sql = testcaseForm.sourceSQL
      }
    } else { // This will handle normal_target
      connectionType = testcaseForm.targetConnection;
      connectionName = testcaseForm.targetDB;
      sql = testcaseForm.targetSQL
    }

    const payload = {
      function_name: "mdt-validate-sql",
      user_id: sessionStorage.getItem("username"),
      domain_name: selectedOrgAppDetails.orgName,
			sub_domain_name: selectedOrgAppDetails.appName,
      env_name: FALCON_ENV === 'prod' ? 'uat' : 'dev',
      connection_type: connectionType,
      connection_id: type === "nexus" ? testcaseForm.workspace.connection_id : undefined,
      connection_name: connectionName,
      sql
    };

    dispatch(showLoading());
    fetch(`${FALCON_API}/sql-operations`,{
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    .then((data) => {
      if(data.status === 200){
        setTestCaseForms(testcaseForms.map((tcf, i) => {
          if(i === index){
            let newTcf = {
              ...tcf
            }
            if(type === "iris" || type === "nexus"){
              newTcf.isSqlValid = true
            } else if(type === "normal_source") {
              newTcf.isSourceSqlValid = true
            } else {
              newTcf.isTargetSqlValid = true
            }
            return newTcf
          } 
          return tcf;
        }));
        dispatch(closeLoading());
        dispatch(
          showSnackbar({
            message: "SQL validation success",
            className: "color-success-background width-50",
          })
        );
      } else {
        dispatch(closeLoading());
        dispatch(
          showSnackbar({
            message: data.errorMessage,
            className: "color-error-background width-50",
          })
        );
        console.log("Not a Valid SQL: ", data)
      }
    })
    .catch((error) => {
      dispatch(closeLoading());
      console.log("error from api: ", error);
    });
  }      

  const getFlattenedFilesArray = files => {
    let options = []
    for (let file in files){
      options.push(<ListSubheader muiSkipListHighlight>{file}</ListSubheader>)
      files[file].map(f => {
        options.push(<MenuItem value={f.path}>{f.file_name}</MenuItem>)
      })
    }
    return options;
  }

  const getCreateTestCaseButton = (testCaseType, isAllSqlValidated, field) => {
    if(testcaseForms[testcaseForms.length - 1].sourceConnection === "s3" 
      || testcaseForms[testcaseForms.length - 1].targetConnection === "s3"){
      return <Button
        variant="contained" 
        style={{ marginRight: "10px" }}  
        className={"btn"} 
        onClick={(e) => {
          if(testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase") {
            setOpenDoubleConfirm(true)
          } else {
            e.preventDefault();
            saveTestCaseForm();
          }
        }}
      >
        {testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase"
        ? "Update"
        : testCaseType === "Bulk Upload"
        ? "Upload"
        : "Create Test Case"}
      </Button>
    } else {
      return <Button 
        variant="contained" 
        style={{ marginRight: "10px" }}  
        className={"btn"} 
        onClick={(e) => {
          if(testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase" || testCaseType === "ExistingNexusTestCase") {
            setOpenDoubleConfirm(true)
          } else {
            e.preventDefault();
            saveTestCaseForm();
          }
        }} 
        disabled={field.execution_engine === "Nexus" ? false : !isAllSqlValidated}
        >
        {testCaseType === "ExistingNormalTestCase" || testCaseType === "ExistingIrisTestCase"  || testCaseType === "ExistingNexusTestCase" 
        ? "Update" : testCaseType === "Bulk Upload" ? "Upload" : "Create Test Case"}
      </Button>
    }
  }

  const getConnectionMenuItems = connections => {    
    const menuItems = [];
    
    for (const connection in connections) {
      menuItems.push(
        <MenuItem value={connection} key={connection}>
          {connection}
        </MenuItem>
      );
    }

    menuItems.push(
      <MenuItem value={"File"} key={"File"}>File</MenuItem>
    );

    return menuItems;
  }

  const getKeyColumnField = (field, index) => {
    if (field.testType === "Data_Testing" || (field.testType === "NLQ_Testing" && field.execution_engine !== "")) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box sx={{ width: "60%" }}>
            <TextField
              variant="outlined"
              size="small"
              label="Key Columns"
              name="keyColumns"
              fullWidth
              value={field.keyColumns}
              onChange={(e) => handleInputChange(e, index)}
              sx={{ marginBottom: "10px" }} // match Test Case Name field
            />
            {field.testType === "Data_Testing" && <FormHelperText>{getHelperText(index, "keyColumns")}</FormHelperText>}
          </Box>
        </Box>
      );
    }
    return null;
  }

  const handleAddStep = (index) => {
    setTestCaseFormIndexForStepModal(index);
    setCurrentStepData({ application: '', env: '', payloadType: 'json', payload: '', formData: [{ key: '', value: '' }] });
    setOpenStepModal(true); 
    setEditingStepId(null);
  };

  // const openEditStep = (step, formIndex) => {
  //   setTestCaseFormIndexForStepModal(formIndex);
  //   setCurrentStepData({
  //     application: step.application || '',
  //     env: step.env || '',
  //     payloadType: step.payloadType || 'json',
  //     payload: step.payload || '',
  //     formData: Array.isArray(step.formData) && step.formData.length ? step.formData.map(f => ({ ...f })) : [{ key: '', value: '' }],
  //   });
  //   setEditingStepId(step.id);
  //   setOpenStepModal(true);
  // };

  const handleSaveStep = () => {
    // Validation logic
    if (!currentStepData.application) {
      dispatch(showSnackbar({ message: "Application is required.", className: "color-error-background width-50" }));
      return;
    }
    if (!currentStepData.env) {
      dispatch(showSnackbar({ message: "Environment is required.", className: "color-error-background width-50" }));
      return;
    }

    if (currentStepData.payloadType === 'json') {
      if (!currentStepData.payload) {
        dispatch(showSnackbar({ message: "JSON Payload is required.", className: "color-error-background width-50" }));
        return;
      }
      try {
        JSON.parse(currentStepData.payload);
      } catch (e) {
        dispatch(showSnackbar({ message: "Invalid JSON Payload.", className: "color-error-background width-50" }));
        return;
      }
    } else if (currentStepData.payloadType === 'form-data') {
      const hasValidFormData = currentStepData.formData.some(
        (row) => row.key && row.value
      );
      if (!hasValidFormData) {
        dispatch(showSnackbar({ message: "At least one Key-Value pair is required for Form Data.", className: "color-error-background width-50" }));
        return;
      }
    }

    // If validations pass, save the step 
    setTestCaseForms(prev => {
      const newForms = [...prev];
      const formIdx = testCaseFormIndexForStepModal;
      const currentSteps = Array.isArray(newForms[formIdx].steps) ? [...newForms[formIdx].steps] : [];

      if (editingStepId) {
        // editing existing step - preserve sequence
        const idx = currentSteps.findIndex(s => s.id === editingStepId);
        if (idx !== -1) {
          const updated = {
            ...currentSteps[idx],
            application: currentStepData.application,
            env: currentStepData.env,
            payloadType: currentStepData.payloadType,
            payload: currentStepData.payload,
            formData: currentStepData.formData ? currentStepData.formData.map(f => ({ ...f })) : [],
          }; 
          currentSteps[idx] = updated;
        }
      } else {
        // new step -> assign next sequence
        const newStep = {
          ...currentStepData,
          id: Date.now() + Math.random(),
          sequence: (() => {
            const max = currentSteps.reduce((m, s) => Math.max(m, s.sequence || 0), 0);
            return max + 1; 
          })(),
        };
        currentSteps.push(newStep);
      }

      // renumber to ensure continuous sequence starting from 1
      newForms[formIdx].steps = renumberSteps(currentSteps);
      newForms[formIdx].isMultiStep = (newForms[formIdx].steps.length > 0); 
      setEditingStepId(null);
      return newForms;
    });

    setOpenStepModal(false);
    setTestCaseFormIndexForStepModal(null);
  };

  const handleCloseStepModal = () => {
    setOpenStepModal(false);
    setTestCaseFormIndexForStepModal(null);
    setEditingStepId(null);
  };

  const handleDeleteStep = (testCaseFormIndex, stepId) => {
    
    setTestCaseForms(prev => {
      const newForms = [...prev];
      const form = { ...newForms[testCaseFormIndex] };
      form.steps = (form.steps || []).filter(step => step.id !== stepId);
      form.steps = renumberSteps(form.steps);
      if (!form.steps.length) form.isMultiStep = false;
      newForms[testCaseFormIndex] = form;
      return newForms;
    });
  };

  // renumberSteps: ensure continuous sequence 1..N based on current order
const renumberSteps = (steps = []) => {
  return (steps || []).map((s, idx) => ({ ...s, sequence: idx + 1 }));
};

// moveStep: reorder steps within a form by index (fromIdx, toIdx are 0-based)
const moveStep = (formIndex, fromIdx, toIdx) => {
  setTestCaseForms(prev => { 
    // shallow copy of forms
    const newForms = [...prev];
    const form = { ...newForms[formIndex] };

    const steps = Array.isArray(form.steps) ? [...form.steps] : [];

    // bounds check
    if (fromIdx < 0 || fromIdx >= steps.length || toIdx < 0 || toIdx >= steps.length) {
      return prev;
    }

    // remove the item and insert at new position
    const [moved] = steps.splice(fromIdx, 1);
    steps.splice(toIdx, 0, moved); 

    // renumber and set back
    form.steps = renumberSteps(steps);
    newForms[formIndex] = form;
    return newForms;
  });
};

const handleStepModalChange = (eOrObj) => {
  // Accept either an event (e.target.name/value) or a partial object { name: value } or full object 
  if (!eOrObj) return;

  // If a DOM event
  if (eOrObj?.target) {
    const { name, value } = eOrObj.target;

    setCurrentStepData((prev) => {
      // If payloadType changes, initialise corresponding fields
      if (name === "payloadType") {
        return {
          ...prev,
          payloadType: value, 
          // ensure proper fields exist for the selected payload type
          formData: value === "form-data" ? (Array.isArray(prev.formData) && prev.formData.length ? prev.formData : [{ key: "", value: "" }]) : [],
          payload: value === "json" ? prev.payload ?? "" : "",
        };
      }

      // Normal field update
      return { 
        ...prev,
        [name]: value,
      };
    });
    return;
  }

  // If caller passed an object / partial state update
  if (typeof eOrObj === "object") {
    setCurrentStepData((prev) => { 
      const next = { ...prev, ...eOrObj };

      // If payloadType provided in object, ensure fields align
      if (eOrObj.payloadType) {
        if (eOrObj.payloadType === "form-data" && (!Array.isArray(next.formData) || next.formData.length === 0)) {
          next.formData = [{ key: "", value: "" }];
          next.payload = "";
        } else if (eOrObj.payloadType === "json") {
          next.formData = [];
          next.payload = next.payload ?? "";
        }
      }

      return next;
    });
  }
}; 

  // const handleEditStep = (stepToEdit, testCaseFormIndex) => {
  //   if (stepToEdit) {
  //     setCurrentStepData({
  //       application: stepToEdit.application,
  //       env: stepToEdit.env,
  //       payloadType: stepToEdit.payloadType,
  //       payload: stepToEdit.payload,
  //       formData: stepToEdit.formData.map(item => ({ ...item })) // Deep copy
  //     });
  //     setTestCaseFormIndexForStepModal(testCaseFormIndex);
  //     setOpenStepModal(true);
  //     // Remove the original step so it can be replaced by the edited one
  //     handleDeleteStep(testCaseFormIndex, stepToEdit.id);

  //     // Implement edit logic here, possibly by pre-filling the modal with stepToEdit data
  //   }
  // }; 
  const handleFormDataChange = (rowIndex, e) => {
  const { name, value } = e.target || {};
  if (typeof rowIndex !== "number") return;

  setCurrentStepData((prev) => {
    const formData = Array.isArray(prev.formData) ? [...prev.formData] : [{ key: "", value: "" }];
    formData[rowIndex] = { ...formData[rowIndex], [name]: value };
    return { ...prev, formData };
  });
}; 

const addFormDataRow = () => {
  setCurrentStepData((prev) => {
    const formData = Array.isArray(prev.formData) ? [...prev.formData] : [];
    formData.push({ key: "", value: "" });
    return { ...prev, formData };
  });
}; 

const removeFormDataRow = (rowIndex) => {
  setCurrentStepData((prev) => {
    const formData = Array.isArray(prev.formData) ? [...prev.formData] : [];
    if (formData.length <= 1) {
      // keep at least one empty row to simplify UI handling
      return { ...prev, formData: [{ key: "", value: "" }] };
    }
    formData.splice(rowIndex, 1);
    return { ...prev, formData };
  }); 
};

  return (
    <>
      <ConfirmDialogWithReason 
        open={openDoubleConfirm}
        onConfirm={onDoubleConfirm} 
        onCancel={onCancelDoubleConfirm}/>

		{/* <Typography fontFamily={"Inter"}>
		{(testCaseType && testCaseType === "ExistingIrisTestCase") ||
		testCaseType === "ExistingNormalTestCase"
			? "Edit Test Case"
			: "Test Case Creation"}
		</Typography> */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Tooltip title="Go back to previous page">
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
      </Box>
	
		{testcaseForms.map((field, index) => (
			<Paper elevation={0} key={index} className={classes.paper} >

        {/* Test Suite */}
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box sx={{ width: "60%" }}>
            <legend>
              <Typography sx={{ fontWeight: "bold", marginBottom: "20px" }} variant="body1"> Test Case Details: </Typography>
            </legend>
            <FormControl variant="standard" className={classes.formControl} sx={{ width: "100%" }}>
              <InputLabel id="test-case-create-label">Test Suite</InputLabel>
              <Select
                name="testSuiteId"
                size="small"
                required
                id="test-case-create-label"
                label="Test Suite"
                value={handleTestSuitValue(field)}
                onChange={(e) => handleInputChange(e, index)}
                onClose={() => setSearchTestSuite("")}
                disabled={
                  testCaseType === "ExistingIrisTestCase" ||
                  testCaseType === "ExistingNormalTestCase"
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: "auto",
                    },
                  },
                  autoFocus: false,
                }}
                renderValue={(selected) => (typeof selected === "number" ? testSuitInfo.find((option) => option?.id === selected)?.name : selected)}
              >
                <ListSubheader>
                  <TextField
                    size="small"
                    autoFocus
                    placeholder="Type to search..."
                    fullWidth
                    onChange={(e) => setSearchTestSuite(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Escape") {
                        e.stopPropagation();
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </ListSubheader>
                {displayedOptions.map((option, i) => (
                  <MenuItem
                    key={i}
                    value={option?.id === -1 ? option?.name : option?.id}
                    onClick={() => {
                      if (option?.id === -1) {
                        setCurrentFormIndex(index);
                        setTestSuiteDialogOpen(true);
                      }
                    }}
                  >
                    {option?.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{getHelperText(index, "testSuiteId")}</FormHelperText>
            </FormControl>
          </Box>
        </Box>

        {/* Test Case Name */}
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box sx={{ width: "60%" }}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              required
              label={"Test Case Name"}
              name="testCaseName"
              value={field.testCaseName}
              onChange={(e) => handleInputChange(e, index)}
              helperText={getHelperText(index, "testCaseName")}
              sx={{ marginBottom: "20px" }}
            />
          </Box>
        </Box>
        
        {/* Test Case Description */}
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box sx={{ width: "60%" }}>
            <TextField
              variant="outlined"
              label="Test Case Description"
              size="small"
              name="testCaseDescription"
              fullWidth
              value={field.testCaseDescription}
              onChange={(e) => handleInputChange(e, index)}
              sx={{ marginBottom: "20px" }}
            />
          </Box>
        </Box>
        {/* Test Case Type */}
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box sx={{ width: "60%", mb: 2 }}>
            <FormControl variant="standard" className={classes.formControl} sx={{ width: "100%" }}>
              <TextField
                name="testType"
                variant="outlined"
                required
                size="small"
                label="Test Type"
                select
                value={field.testType}
                disabled={testCaseType === "ExistingNormalTestCase"}
                onChange={(e) => handleInputChange(e, index)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 150,
                      overflowY: "auto",
                    },
                  },
                }}
              >
                <MenuItem value="Data_Testing">Data Testing</MenuItem>
                <MenuItem value="NLQ_Testing">NLQ Testing</MenuItem>
              </TextField>
              <FormHelperText>{getHelperText(index, "testType")}</FormHelperText>
            </FormControl>
            {field.testType === "NLQ_Testing" && (
              <FormControl variant="standard" className={classes.formControl} sx={{ width: "100%",  }}>
                <TextField
                  name="execution_engine"
                  variant="outlined"
                  required
                  size="small"
                  label="Execution Engine"
                  select
                  value={field.execution_engine}
                  disabled={testCaseType === "ExistingNormalTestCase"}
                  onChange={(e) => handleInputChange(e, index)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 150,
                        overflowY: "auto",
                      },
                    },
                  }}
                >
                  <MenuItem value="Iris">Iris</MenuItem>
                  <MenuItem value="Nexus">Nexus</MenuItem>
                </TextField>
                <FormHelperText>{getHelperText(index, "execution_engine")}</FormHelperText>
              </FormControl>
            )}
          </Box>
        </Box>

				{/* Connection Details */}
        {field.testType === "Data_Testing" || (field.testType === "NLQ_Testing" && field.execution_engine !== "") ? <>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={2}>
            <Box sx={{ width: "60%" }}>
                <legend>
                  <Typography sx={{fontWeight: "bold", marginBottom: "20px"}} variant="body1"> Connection Details: </Typography>
                </legend>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  {field.testType === "Data_Testing" && (
                    <Box sx={{ }}>
                      <FormControlLabel
                        control={
                          <Checkbox checked={field.isMultiStep} onChange={(e) => handleInputChange(e, index)} name="isMultiStep" />
                        }
                        label="Enable Multi-step (Baseline)"
                      />
                    </Box>
                  )}
                  {field.isMultiStep && field.steps?.length > 1 ? (
                    <RadioGroup row name="stepExecutionType" value={stepExecutionType} onChange={(e) => handleStepExecutionTypeChange(e, index)}>
                      <FormControlLabel value="sync" control={<Radio />} label="Sync" />
                      <FormControlLabel value="async" control={<Radio />} label="Async" />
                    </RadioGroup>
                  ) : null}
                  {field.isMultiStep && (field.steps?.length === 0 || field.steps?.length > 0) ? (
                    <Button
                      sx={{ height: "60%", mt: "5px" }}
                      startIcon={<AddCircle />}
                      size="small"
                      variant="contained"
                      className="btn"
                      onClick={() => handleAddStep(index)}
                    >Add Step</Button>
                  ) : null}
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
                  {field.isMultiStep ? <RenderMultiStepTable
                    steps={field.steps} 
                    formIndex={index} 
                    handleDeleteStep={handleDeleteStep}
                    stepExecutionType={stepExecutionType}
                    moveStep={moveStep}/> : null}
                </Box>
                
                
                <Box display={"flex"} sx={{gap: "5px"}}>
                  {field.execution_engine === "Iris" ? 
                    <FormControl variant="standard" className={classes.formControl}>
                      <TextField 
                        variant="outlined" 
                        label="Iris Version"
                        size="small"
                        select
                        fullWidth 
                        name="iris_version" 
                        value={field.iris_version} 
                        onChange={(e) => handleInputChange(e, index)}>
                          <MenuItem value={"Iris_DEV_V2"}>Iris_DEV</MenuItem>
                          <MenuItem value={"Iris_UAT_V2"}>Iris_UAT</MenuItem>
                          <MenuItem value={"Iris_PROD_V2"}>Iris_PROD</MenuItem>
                      </TextField>
                      <FormHelperText>{getHelperText(index, "iris_version")}</FormHelperText>
                    </FormControl>
                  : null}

                  {testCaseType === "ExistingNormalTestCase" || field.testType === "Data_Testing" || (field.testType === "NLQ_Testing" && field.execution_engine !== "Nexus") ?
                    <FormControl variant="standard" className={classes.formControl}>
                      <TextField
                        name="sourceConnection"
                        value={field.sourceConnection}
                        size="small"
                        select
                        label="Source Connection Type"
                        required
                        onChange={(e) => handleInputChange(e, index)}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 150,
                              overflowY: "auto",
                            },
                          },
                        }}
                        readOnly={testCaseType === "ExistingIrisTestCase"}  
                        disabled={testCaseType === "ExistingNormalTestCase"}                   
                      >
                        {
                        // testCaseType === "ExistingNormalTestCase" || field.testType === "Data_Testing" || field.testType === "Unary" ? 
                          // getConnectionDetailes?.filter((title) => title.connection_type_name !== "Iris").map((data) => (
                          //   <MenuItem key={data.connection_type_id} value={data.connection_type_name}>
                          //     {data.connection_type_name}
                          //   </MenuItem>
                          // ))
                          // : getConnectionDetailes?.filter((title) => title.connection_type_name === "Iris").map((data) => (
                          //   <MenuItem key={data.connection_type_id} value={data.connection_type_name}>
                          //     {data.connection_type_name}
                          //   </MenuItem>)
                          // )
                          }
                          {
                            getConnectionMenuItems(getConnectionDetailes)
                          }
                      </TextField>
                      <FormHelperText>{getHelperText(index, "sourceConnection")}</FormHelperText>
                    </FormControl>
                  : null}

                  {field.testType === "Data_Testing" ? <>
                    
                      {field.sourceConnection !== "File" ? (
                          <FormControl variant="standard" className={classes.formControl}>
                            <TextField
                              name="sourceDB"
                              size="small"
                              variant="outlined"
                              label="Source Connection"
                              required
                              select
                              value={field.sourceDB}
                              onChange={(e) => handleInputChange(e, index)}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 150,
                                    overflowY: "auto",
                                  },
                                },
                              }}
                              >
                            {getDBDetailes[index]?.map((conn) => (
                              <MenuItem key={conn.connectionName} value={conn.connectionName}>
                                {conn.connectionName}
                              </MenuItem>
                            ))}
                            </TextField>
                            <FormHelperText>{getHelperText(index, "sourceDB")}</FormHelperText>
                          </FormControl>
                      ) : (
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="file"
                              variant="standard"
                              inputProps={{ accept: ".csv,.xlsx,.xls,.json,.parquet" }}
                              onChange={(e) => handleFileUpload(e, index, "source_file")}
                            />
                            <Button 
                              variant="contained" 
                              size="small"
                              className="btn"
                              disabled={!testcaseForms[index].source_file_object}
                              onClick={() => handleFileUploadToS3(index, "source_file")}
                            >
                              Upload
                            </Button>
                          </Box>
                      )}
                  </>
                  : (field.testType === "NLQ_Testing" && field.execution_engine === "Iris") ?
                    <FormControl variant="standard" className={classes.formControl}>
                      <TextField
                        name="sourceDB"
                        size="small"
                        variant="outlined"
                        label="Source Connection"
                        required
                        select
                        value={field.sourceDB}
                        onChange={(e) => handleInputChange(e, index)}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 150,
                              overflowY: "auto",
                            },
                          },
                        }}
                      >
                    {getDBDetailes[index]?.map((conn) => (
                      <MenuItem key={conn.connectionName} value={conn.connectionName}>
                        {conn.connectionName}
                      </MenuItem>
                    ))}
                    </TextField>
                    <FormHelperText>{getHelperText(index, "sourceDB")}</FormHelperText>
                  </FormControl>
                  : null}
                </Box>
            </Box>
            
            { 
              field.testType === "NLQ_Testing" ? (
                <IrisTestCase
                  accordion={accordion}
                  handleInputChange={handleInputChange}
                  getHelperText={getHelperText} 
                  field={field}
                  handleTestTypeChange={handleTestTypeChange}
                  index={index}
                  classes={classes}
                  getDBDetailes={getDBDetailes}
                  anchorEl={anchorEl}
                  setAnchorEl={setAnchorEl}
                  handleDomainSelect={handleDomainSelect}
                  handleWorkspaceSelect={handleWorkspaceSelect}
                  irisDomainList={irisDomainList}
                  validateSqlHandler={validateSqlHandler}
                  setTestCaseForms={setTestCaseForms}
                  testcaseForms={testcaseForms}
                  nexusDomains={nexusDomains}
              />) : (
              <>
                {/* Target Connection Details */}
                {field.testType === "Data_Testing" && ( 
                  <Box sx={{ width: "60%",  }}>
                    <Box display="flex" sx={{ gap: "5px" }}>
                      <Box sx={{ width: "50%" }}>
                        <FormControl variant="standard" className={classes.formControl}>
                          <TextField
                            name="targetConnection"
                            size="small"
                            select
                            variant="outlined"
                            required
                            label="Target Connection Type"
                            value={field.targetConnection}
                            onChange={(e) => handleInputChange(e, index)}
                            disabled={testCaseType === "ExistingNormalTestCase"}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 150,
                                  overflowY: "auto",
                                },
                              },
                            }}
                          >
                            {getConnectionMenuItems(getConnectionDetailes)}
                          </TextField>
                          <FormHelperText>{getHelperText(index, "targetConnection")}</FormHelperText>
                        </FormControl>
                      </Box>
                      <Box sx={{ width: "50%" }}>
                        {field.targetConnection !== "File" ? (
                          <FormControl variant="standard" className={classes.formControl}>
                            <TextField
                              name="targetDB"
                              size="small"
                              label="Target Connection"
                              select
                              required
                              variant="outlined"
                              value={field.targetDB}
                              onChange={(e) => handleInputChange(e, index)}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 150,
                                    overflowY: "auto",
                                  },
                                },
                              }}
                            >
                              {getTargetDBDetailes[index]?.map((conn) => (
                                <MenuItem key={conn.connectionName} value={conn.connectionName}>
                                  {conn.connectionName}
                                </MenuItem>
                              ))}
                            </TextField>
                            <FormHelperText>{getHelperText(index, "targetDB")}</FormHelperText>
                          </FormControl>
                        ) : (
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="file"
                              variant="standard"
                              inputProps={{ accept: ".csv,.xlsx,.xls,.json,.parquet" }}
                              onChange={(e) => handleFileUpload(e, index, "target_file")}
                            />
                            <Button 
                              variant="contained" 
                              size="small"
                              className="btn"
                              disabled={!testcaseForms[index].target_file_object}
                              onClick={() => handleFileUploadToS3(index, "target_file")}
                            >
                              Upload
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {field.testType === "Data_Testing" && <>
                  {/* SQL Section */}
                  <Box sx={{ width: "60%" }}>
                    <Box display="flex" sx={{ gap: "5px" }}>
                      <Box sx={{ width: "50%" }}>
                        <FormControl sx={{ width: "100%" }}>
                          {field.sourceConnection !== "s3" && field.sourceConnection !== "File" && <>
                            <TextField
                            label={<> Source SQL <span >*</span></>}
                            rows={5}
                            multiline
                            name="sourceSQL"
                            value={field.sourceSQL}
                            onChange={(e) => handleInputChange(e, index)}
                            helperText={getHelperText(index, "sourceSQL")}
                            disabled={field.sourceConnection === "s3"}
                            />
                            <Button 
                            variant="contained" 
                            style={{ width: "50%", marginTop: "5px"}} 
                            className={"btn"} 
                            disabled={(field.isSourceSqlValid 
                              || field.sourceConnection === "" 
                              || field.sourceDB === ""
                              || field.sourceSQL === "")
                            }
                            onClick={() => {validateSqlHandler('normal_source', field, index)}}>
                            Validate SQL
                            </Button>
                          </>}
                          {field.sourceConnection === "s3" && <>
                            <TextField 
                              variant="outlined" 
                              label="Source File Path"
                              size="small"
                              select
                              fullWidth 
                              name="source_file" 
                              value={field.source_file} 
                              onChange={(e) => handleFileUpload(e, index, "source_file")}
                              InputLabelProps={{ shrink: true }}
                              sx={{ minWidth: "200px" }}
                            />
                          </>}
                        </FormControl>
                      </Box>
                      <Box sx={{ width: "50%" }}>
                        <FormControl sx={{ width: "100%" }}>
                          {field.targetConnection !== "s3" && field.targetConnection !== "File" && <>
                            <TextField
                              label={<> Target SQL <span >*</span></>}
                              rows={5}
                              multiline
                              name="targetSQL"
                              value={field.targetSQL}
                              onChange={(e) => handleInputChange(e, index)}
                              helperText={getHelperText(index, "targetSQL")}
                              disabled={field.targetConnection === "s3"}
                              />
                            <Button 
                            variant="contained" 
                            style={{ width: "50%", marginTop: "5px"}} 
                            className={"btn"} 
                            disabled={(field.isTargetSqlValid 
                              || field.targetConnection === "" 
                              || field.targetDB === ""
                              || field.targetSQL === "")
                            }
                            onClick={() => {validateSqlHandler('normal_target', field, index)}}>
                            Validate SQL
                            </Button>
                          </>}
                          {field.targetConnection === "s3" && <>
                            <TextField 
                              variant="outlined" 
                              label="Target File Path"
                              size="small"
                              select
                              fullWidth 
                              name="target_file" 
                              value={field.target_file} 
                              onChange={(e) => handleFileUpload(e, index, "target_file")}
                              InputLabelProps={{ shrink: true }}
                              sx={{ minWidth: "200px" }}
                            />
                          </>}
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>
                </>}
              </>)
            }
          </Box>
        </> : null }
        {getKeyColumnField(field, index)}
          
				<Grid container alignItems="center" justifyContent="center" sx={{marginBottom: "50px"}}>
					<Grid item xs={8}>
						<Box display={"flex"} justifyContent="space-between" mt={2}>
							<Box>
								{index === testcaseForms.length - 1 && getCreateTestCaseButton(testCaseType, isAllSqlValidated, field)}
								<Button variant="outlined" color="primary" onClick={() => resetTestCaseForm(index)}>Reset</Button>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		))}

    <TestSuiteDialog open={testSuiteDialogOpen} handleClose={handleClose} saveTestSuite={saveTestSuite} title="Create Test Suite" testSuiteDetailes={testSuiteDetailes} setTestSuiteDetailes={setTestSuiteDetailes} isRequired={isRequired} setIsRequired={setIsRequired} />
    <MultiStepModal 
      openStepModal={openStepModal}
      handleCloseStepModal={handleCloseStepModal}
      currentStepData={currentStepData}
      handleStepModalChange={handleStepModalChange}
      handleSaveStep={handleSaveStep}
      handleFormDataChange={handleFormDataChange}
      addFormDataRow={addFormDataRow}
      removeFormDataRow={removeFormDataRow}
      styleModal={styleModal}
    />
    </>
  );
};

export default TestCase;
