import { Autocomplete, Box, Button, Checkbox, Chip, FormControl, FormControlLabel, FormGroup, Grid, IconButton, Input, InputAdornment, InputLabel, ListSubheader, MenuItem, Modal, Radio, RadioGroup, Select, Stack, Switch, TextareaAutosize, Tooltip } from "@mui/material";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { FALCON_API, FALCON_ENV, GUARDIAN_API } from "../../../environment";
import { getDataFromStorage } from "../../utils/utility";
import { useGetTestSuitMutation } from "../../store/mdtSlice";
import { CloudUpload, Edit, Search, Tty } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from '@mui/material';
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { CustomStatus } from "../ExecutionHistory/RenderTestCycles";
import TestSuiteDialog from "../../components/TestSuiteDialog/TestSuiteDialog";
import { redirectToLogin } from "../../store/apiSlice";

const styleModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

const TestCaseQuestionGenerate = () => {
    const [assistant, setAssistant] = useState("openai");
    const [irisVersion, setIrisVersion] = useState("");
    const [workspaces, setWorkspaces] = useState([]);
    const [workspace, setWorkspace] = useState("");
    const [irisDatabases, setIrisDatabases] = useState([]);
    const [irisDatabase, setIrisDatabase] = useState("");
    const [fileJsonData, setFileJsonData] = useState([]);
    const [referenceQuestions, setReferenceQuestions] = useState([]);
    const [prompt, setPrompt] = useState("");

    const [openDoubleConfirm, setOpenDoubleConfirm] = useState(false);
    const [numberofQuestions, setNumberOfQuestions] = useState(5);
    const [questions, setQuestions] = useState([]);
    const [userQuestion, setUserQuestion] = useState("");
    const [type, setType] = useState("gen_mulitple_question");
    const [rephraseWithEntities, setRephraseWithEntities] = useState(false);
    const [entityMaster, setEntityMaster] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);

    const [openEditTestcaseModal, setOpenEditTestcaseModal] = useState(false);
    const [editingTestcase, setEditingTestcase] = useState(null);
    const [selectedTestcases, setSelectedTestcases] = useState([]);

    const [isRequired, setIsRequired] = useState(false);
    const [testSuiteValue, setTestSuiteValue] = useState("");
    const [searchTestSuite, setSearchTestSuite] = useState("");
    const [testSuitInfo, setTestSuitInfo] = useState([]);
    const [testSuiteDialogOpen, setTestSuiteDialogOpen] = useState(false);
    const [displayedOptions, setDisplayedOptions] = useState([]);
    const [testSuiteDetailes, setTestSuiteDetailes] = useState([{name: "", description: ""}]);
    const [testType, setTestType] = useState(['Accuracy']);
    const [iteration, setIteration] = useState("");

    const [createdQuestionIds, setCreatedQuestionIds] = useState([]);

    const [getTestSuit] = useGetTestSuitMutation();
    const apiRef = useGridApiRef();
    const { selectedOrgAppDetails } = useSelector((state) => state.data);
    
    // Runs on Load
    useEffect(() => {
        if (selectedOrgAppDetails?.orgName && selectedOrgAppDetails?.appName) {
            fetchConnectionDetails();
        }
        fetchTestSuitInfo();
    }, [selectedOrgAppDetails]); 
    
    useEffect(() => {
        const filteredOptions = testSuitInfo.filter((option) => containsText(option?.name, searchTestSuite));
        if (!searchTestSuite) {
            setDisplayedOptions([testSuitInfo.find((option) => option?.name === "Default"), createTestsuiteOption]);
        } else {
            setDisplayedOptions([...filteredOptions, createTestsuiteOption]);
        }
    }, [searchTestSuite, testSuitInfo]);

    useEffect(() => {
        if (fileJsonData.length > 0) {
            const allHaveQuestionKey = fileJsonData.every(item => item.hasOwnProperty('question'));
            
            if (!allHaveQuestionKey) {
                dispatch(
                    showSnackbar({
                        message: '"question" column is missing in selected file',
                        className: 'color-error-background width-50',
                    })
                );
            } else {
                dispatch(
                    showSnackbar({
                        message: 'File upload successful',
                        className: 'color-success-background width-50',
                    })
                );
                setReferenceQuestions(fileJsonData.map((item) => ({ question: item.question })));
            }
        }
    }, [fileJsonData]);

    const dispatch = useDispatch();

    const handleOpenDoubleConfirm = () => {
        setOpenDoubleConfirm(true);
    };

    const createTestsuiteOption = { id: -1, name: "Create Testsuite" };
    const containsText = (text, searchTestSuite) => text.toLowerCase().indexOf(searchTestSuite.toLowerCase()) > -1;

    const handleCloseDoubleConfirm = () => {
        setOpenDoubleConfirm(false);
    };

    const generateQuestion = (rephrase = false) => {
        dispatch(showLoading());
        const payload = {
            function_name: "mdt-question-sql-generation",
            workspace_name: workspaces?.find(wk => wk.workspace_id === workspace)?.domain_name,
            workspace_id: workspace,
            user_question: type === "user_defined" || type === "rephrase" ? userQuestion : undefined,
            user_id: sessionStorage.getItem("username"),
            iris_version: irisVersion,
            entities: rephraseWithEntities,
            gpt_selection: assistant,
            method: "asynchronous",
            user_custom_prompt: prompt !== "" ? prompt : undefined,
        }

        if(rephraseWithEntities && selectedEntities.length){
            payload.entities_list = selectedEntities.map(se => se.entity_name);
        }
        
        if(rephrase) {
            payload.rephrase = true
            payload.no_of_question = 5
        } else if(type === "gen_mulitple_question") {
            payload.no_of_question = parseInt(numberofQuestions)
            payload.reference_questions = referenceQuestions
        } else {
            payload.rephrase = false
            payload.no_of_question = 0
        }
        setQuestions([])
        fetch(`${FALCON_API}/sql-operations`, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
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
			if(response.body && response.body.length) {
				setQuestions(response.body.map((question, index) => ({
                    ...question, 
                    id: index + Date.now() + Math.random(),
                    isSqlValid: "Not Validated",
                    status: "Not Created"
                })))
			} else {
                dispatch(showSnackbar({
                    message: "Unable to process your request at the moment, Please try again later!",
                    className: "color-error-background width-50",
                }))
            }
			dispatch(closeLoading());
            handleCloseDoubleConfirm();
		}).catch((error) => {
			console.log(error);
            handleCloseDoubleConfirm();
			dispatch(closeLoading());
            dispatch(showSnackbar({
                message: "Unable to process your request at the moment, Please try again later!",
                className: "color-error-background width-50",
            }))
		});
    }

    const handleWorkspaceChange = (e) => {
        fetchEntities(e.target.value);
        setWorkspace(e.target.value);
        setQuestions([]);
        setUserQuestion("");
    }

    const handleIrisVersionChange = (e) => {
        setIrisVersion(e.target.value);
        setWorkspace("");
        setQuestions([]);
        setUserQuestion("");
        fetchWorkspaces(e.target.value);
    }

    const fetchWorkspaces = (irisVersionArg) => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/access-operations`, {
			method: 'POST',
			body: JSON.stringify({
				function_name: "get-workspace-id"  ,
				user_id: sessionStorage.getItem("username"),
                // user_id: "vikudipudi@contractor.ea.com",
                iris_version: irisVersionArg
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
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
			if(response.body && response.statusCode === 200) {
				setWorkspaces(response.body);
			} else {
                dispatch(showSnackbar({
                    message: response.message,
                    className: "color-error-background width-50",
                }))
                setWorkspaces([])
            }

			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};

    const fetchConnectionDetails = async () => {
        const token = getDataFromStorage("token");

        try {
            fetch(`${GUARDIAN_API}&domainName=${selectedOrgAppDetails.orgName}&subDomainName=${selectedOrgAppDetails.appName}`, {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                    IdentityProvider: "aws_cognito"
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
            .then(data => {
                if (data.statusCode === 200) {
                    for(let type in data.connection_name){
                        if(type === "Snowflake"){
                            // setIrisSourceDBList(data.connection_name[type])
                            setIrisDatabases(data.connection_name[type])
                        }
                    }
                }
            }).catch(err => {
                console.log(err);
            });

        } catch (error) {
            console.error("Error fetching connection details:", error);
        }
    };

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
            dispatch(closeLoading());
            console.error("Error fetching Test Suite info:", error);
        }
    };
    

    const fetchEntities = async (workspaceId) => {
        try {
            dispatch(showLoading());
            const token = getDataFromStorage("token");
            const payload = {
                function_name: "mdt-entity-handler",
                user_id: sessionStorage.getItem("username"),
                workspace_id: workspaceId,
            };
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
                    
                    if(data.statusCode === 200){
                        if(data.body && data.body.length){
                            setEntityMaster(data.body.map((ent, index) => ({id: index, entity_name: ent})));
                        } else {
                            setEntityMaster([]);
                        }
                    }
                    dispatch(closeLoading());
                })
                .catch((error) => {
                    dispatch(closeLoading());
                    console.log("error from api: ", error);
                });

        } catch (error) {
            dispatch(closeLoading());
            console.error("Error fetching entities:", error);
        }
    }

    const saveTestSuite = () => {
        const newTestsuite = {
            id: testSuitInfo.length + 1,
            name: testSuiteDetailes.name,
            description: testSuiteDetailes.description,
        };
    
        // Update the testSuitInfo state with the new test suite
        setTestSuitInfo((prevState) => {
            const updatedOptions = [...prevState, newTestsuite];
            return updatedOptions;
        });
    
        // Set the selected test suite value to the newly created one
        setTestSuiteValue(newTestsuite);
    
        // Now update displayedOptions to reflect the newly added test suite
        setDisplayedOptions((prevState) => {
            const filteredOptions = prevState.filter(option => option?.name !== "Create Testsuite"); // Remove the 'Create Testsuite' option
            return [...filteredOptions, newTestsuite]; // Add the new test suite to the options
        });
    
        setTestSuiteDialogOpen(false);
        setTestSuiteDetailes({ name: "", description: "" });
    };

    const renderFinalButton = () => {
        if(type === "user_defined"){
            return <Button 
                sx={{background: "#0ea5e9 !important", color: "white"}} 
                onClick={() => {generateQuestion(false)}}>{`Generate SQL`}</Button>
        } else if(type === "gen_mulitple_question") {
            return <Button 
                sx={{background: "#0ea5e9 !important", color: "white"}} 
                onClick={handleOpenDoubleConfirm}>{`Generate Questions`}</Button>
        } else if(type === "rephrase") {
            return <Button 
                sx={{background: "#0ea5e9 !important", color: "white"}} 
                onClick={() => {generateQuestion(true)}}>{`Rephrase Questions`}</Button>
        }
    };

    const getStatusColor = (status) => {	
        switch (status) {
            case "Not Created":
                return "grey";
            case "Created":
                return "green";
            case "Failed":
                return "red";
            default:
                return "";
        }
    };

    const validateSql = (row) => {
        if(irisDatabase === ""){
            dispatch(
                showSnackbar({
                    message: "Connection must be selected for SQL Validation",
                    className: "color-error-background width-50",
                })
            );
            return;
        }

        const payload = {
            function_name: "mdt-validate-sql",
            user_id: sessionStorage.getItem("username"),
            domain_name: selectedOrgAppDetails.orgName,
            sub_domain_name: selectedOrgAppDetails.appName,
            env_name: FALCON_ENV === 'falcon-react-dev2-local' ? 'dev' : 'uat',
            connection_type: "Iris",
            connection_name: irisDatabase,
            sql: row.sql
        };
    
        dispatch(showLoading());
        fetch(`${FALCON_API}/sql-operations`,{
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getDataFromStorage("token")}`,
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
                setQuestions([...questions.map(q => {
                    if(q.id === row.id){
                        return {
                            ...q,
                            isSqlValid: "Valid"
                        }
                    } else {
                        return q
                    }
                })]);
                dispatch(closeLoading());
                dispatch(
                    showSnackbar({
                        message: "SQL validation success",
                        className: "color-success-background width-50",
                    })
                );
            } else {
                setQuestions([...questions.map(q => {
                    if(q.id === row.id){
                        return {
                            ...q,
                            isSqlValid: "Invalid"
                        }
                    } else {
                        return q
                    }
                })])
                dispatch(closeLoading());
                dispatch(
                    showSnackbar({
                        message: data.errorMessage ? data.errorMessage : data.message,
                        className: "color-error-background width-50",
                    })
                );
            }
        })
        .catch((error) => {
            dispatch(closeLoading());
            console.log("error from api: ", error);
        });
    };

    const handleTestTypeChange = (event, tt) => {
        const isChecked = event.target.checked;
        const uniqueSet = new Set(testType);

        if(isChecked){
            uniqueSet.add(tt);
        } else {
            uniqueSet.delete(tt)
        }
        
        setTestType([...uniqueSet])
    };

    const handleAssistantChange = (e) => {
        setAssistant(e.target.value);
    };
    
    const createTestcaseHandler = () => {
        const domainName = workspaces.find(wor => wor.workspace_id === workspace).domain_name;
        let testSuiteId = undefined;
        if(typeof testSuiteValue === "number"){
            testSuiteId = testSuiteValue
        } else {
            testSuiteId = {
                test_suite_name: testSuiteValue.name,
                test_suite_description: testSuiteValue.description
            }
        }

        const selectedMinusAlreadyCreatedTCArray = selectedTestcases.filter(item => !createdQuestionIds.includes(item));

        if(selectedMinusAlreadyCreatedTCArray.length){
            const payload = {
                function_name: "mdt-create-iris-testcase",
                user_id: sessionStorage.getItem("username"),
                test_cases: [...selectedMinusAlreadyCreatedTCArray.map(st => {
                    const currentTC = questions.find(ques => ques.id === st);
                    return {
                        domain_name: selectedOrgAppDetails.orgName,
				        sub_domain_name: selectedOrgAppDetails.appName,
                        testCaseName: currentTC.question,
                        testCaseDescription: "",
                        testType: "NLQ_Testing",
                        execution_engine: "Iris",
                        sourceConnection: "Snowflake",
                        test_type: testType,
                        sourceDB: irisDatabase,
                        iteration,
                        testSuiteId: testSuiteId,
                        domain: domainName,
                        Question_to_IRIS: currentTC.question,
                        Expected_SQL: currentTC.sql,
                        iris_version: irisVersion,
                    }
                })]
            };        
            
            dispatch(showLoading());
            fetch(`${FALCON_API}/test-case`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getDataFromStorage("token")}`,
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
                if(data.statusCode === 200){
                    //TODO: throw toast telling how manu passed
                    // set questions[] with updated status
                    if(data.body.length){
                        const createdQuestionIds = [];
                        setQuestions([...questions.map(ques => {
                            const matchingTestcase = data.body.find(response => response.testcasename === ques.question);
                            
                            if(matchingTestcase){
                                if(matchingTestcase.iscreate){
                                    createdQuestionIds.push(ques.id)
                                }
                                return {
                                    ...ques,
                                    status: matchingTestcase.iscreate ? "Created" : "Failed",
                                    message: matchingTestcase.message
                                }
                            } else {
                                return ques
                            }
                        })])
                        setCreatedQuestionIds(createdQuestionIds)
                    }
                    dispatch(closeLoading());
                    dispatch(showSnackbar({
                        message: data.message,
                        className: `color-${data.is_all_created ? "success" : "error"}-background width-50`,
                    }));
                } else {
                    dispatch(closeLoading());
                    dispatch(showSnackbar({
                        message: "Unable to create testcase at the moment, Please try again later.",
                        className: "color-error-background width-50",
                    }))
                }
            })
            .catch((error) => {
                dispatch(closeLoading());
                console.log("error from api: ", error);
            });
        } else {
            dispatch(showSnackbar({
                message: "No test case selected for creation",
                className: "color-error-background width-50",
            }))
        }
    }

    const handleReset = () => {
        setIrisVersion("")
        setWorkspaces([])
        setWorkspace("")
        // setIrisConnectionId("")
        // setIrisDatabases([])
        setIrisDatabase("")
        setOpenDoubleConfirm(false)
        setNumberOfQuestions(5)
        setQuestions([])
        setUserQuestion("")
        setType("gen_mulitple_question")
        setOpenEditTestcaseModal(false)
        setEditingTestcase(null)
        setSelectedTestcases([])
        setIsRequired(false)
        setTestSuiteValue("")
        setSearchTestSuite("")
        setTestSuitInfo([])
        setTestSuiteDialogOpen(false)
        setDisplayedOptions([])
        setTestSuiteDetailes([{name: "", description: ""}])
        setTestType(['Accuracy'])
        setIteration("")
        setCreatedQuestionIds([])
    }

    const handleUpload = (event) => {
        const file = event.target.files[0];

        if (!file) return;
    
        if (file.type === 'text/csv') {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setFileJsonData(results.data);
            },
          });
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          const reader = new FileReader();
          reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setFileJsonData(jsonData);
          };
          reader.readAsBinaryString(file);
        }
    };

    const createExcelAndDownload = () => {
        if(questions.length){
            const ws = XLSX.utils.json_to_sheet(questions.map((q, i) => ({
                SNo: i + 1,
                organization_name: selectedOrgAppDetails.orgName,
                application_name: selectedOrgAppDetails.appName,
                testSuiteName: "",
                testCaseName: q.question,
                testCaseDescription: "",
                sourceConnectionType: "Iris",
                databaseConnection: irisDatabases.find(ird => ird.connection_id === irisDatabase).connection_name,
                test_type: "",
                iteration: "",
                IrisVersion: irisVersion,
                domain: workspaces?.find(wk => wk.workspace_id === workspace)?.domain_name,
                Question_to_IRIS: q.question,
                Expected_SQL: q.sql,
                KeyColumns: ""
            })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Questions");
            XLSX.writeFile(wb, `GPT_generated_questions.xlsx`);
        }
    }

    console.log(selectedTestcases);
    

    return <>
        <Box component="section" sx={{ border: '0px solid grey', margin: "20px 50px 80px 0px" }}>
            <Box sx={{ display: "flex", gap: 3, mb: "20px" }}>
                <Box sx={{ width: "33%" }}>
                    <TextField 
                        variant="outlined" 
                        label="Select Assistant"
                        size="small"
                        select
                        fullWidth 
                        value={assistant}
                        required
                        onChange={handleAssistantChange}>
                        <MenuItem value={"openai"}>Open AI</MenuItem>
                        <MenuItem value={"claude"}>Claude AI</MenuItem>
                    </TextField>
                </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: "33.33%" }}>
                    <TextField 
                        variant="outlined" 
                        label="Iris Version"
                        size="small"
                        select
                        fullWidth 
                        value={irisVersion}
                        required
                        onChange={handleIrisVersionChange}>

                        <MenuItem value={"Iris_DEV_V2"}>Iris_DEV</MenuItem>
                        <MenuItem value={"Iris_UAT_V2"}>Iris_UAT</MenuItem>
                        <MenuItem value={"Iris_PROD_V2"}>Iris_PROD</MenuItem>
                    </TextField>
                </Box>

                {irisVersion !== "" &&
                <Box sx={{ width: "33.33%" }}>
                    <TextField
                        variant="outlined"
                        label="Workspace"
                        size="small"
                        select
                        fullWidth
                        required
                        value={workspace}
                        onChange={(e) => handleWorkspaceChange(e)}
                    >
                        {workspaces?.map((ws) => (
                            <MenuItem key={ws.workspace_id} value={ws.workspace_id}>
                                {ws.domain_name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>}

                {irisVersion !== "" &&
                <Box sx={{ width: "33.33%" }}>
                    <TextField
                        variant="outlined"
                        label="Connection"
                        size="small"
                        select
                        fullWidth
                        value={irisDatabase}
                        onChange={(e) => {setIrisDatabase(e.target.value)}}
                    >
                        {irisDatabases?.map((ws) => (
                            <MenuItem key={ws.connectionName} value={ws.connectionName}>
                                {ws.connectionName}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>}
            </Box>

            {/* Textarea to capture user prompt */}
            {workspace &&

                <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <TextareaAutosize
                        minRows={3}
                        placeholder="Provide additional context or instructions for question generation (optional)"
                        value={prompt}
                        onChange={(e) => {setPrompt(e.target.value)}}
                        style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                    />
                </Box>
            }

            <Box sx={{ display: "flex", direction: "row", justifyContent: type === "gen_mulitple_question" ? "space-between" : "flex-end", mt: 2 }}>
                {type === "gen_mulitple_question" &&
                    <Button
                        component="label"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUpload />}
                    >
                        Upload Rules & Ref Questions
                        <VisuallyHiddenInput
                            type="file"
                            onChange={handleUpload}
                        />
                    </Button>
                }
                {workspace &&
                    <RadioGroup 
                        value={type} 
                        onChange={(e) => {
                            setUserQuestion("");
                            setType(e.target.value); 
                            setQuestions([]);
                            setSelectedTestcases([]);
                        }}  
                        defaultValue="gen_mulitple_question" 
                        row>
                        {/* <FormControlLabel control={<Switch value={isQuestionDefinedByUser} onChange={(e) => {setQuestions([]);setIsQuestionDefinedByUser(e.target.checked)}}/>} label="User Defined Question" /> */}
                        <FormControlLabel value="user_defined" control={<Radio />} label="Generate SQL" />
                        <FormControlLabel value="rephrase" control={<Radio />} label="Rephrase Question" />
                        <FormControlLabel value="gen_mulitple_question" control={<Radio />} label="Generate Multiple Questions" />
                    </RadioGroup>
                }
            </Box>

            {type === "rephrase" && <Box mt={2}>
                <div style={{display: "flex", alignItems: "center", gap: "20px"}}>   
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rephraseWithEntities}
                                onChange={(e) => setRephraseWithEntities(e.target.checked)}
                                name="rephraseWithEntities"
                            />
                        }
                        label="Rephrase with entities"
                    />
                    {rephraseWithEntities &&
                        <Autocomplete
                                multiple
                                options={entityMaster}
                                getOptionLabel={(option) => option.entity_name}
                                renderInput={(params) => (
                                    <TextField sx={{ width: "400px"}} {...params} label="Select Entities" placeholder="Entities" />
                                )}
                                onChange={(event, value) => {
                                    setSelectedEntities(value);
                                }}
                                isOptionEqualToValue={(option, value) => option.entity_name === value.entity_name}
                            />
                    }
                </div>
            </Box>}

            {type === "user_defined" || type === "rephrase" ? 
                <Box sx={{ mt: 2 }}>
                    <TextField
                    sx={{ marginTop: '20px' }}
                    label={type === "user_defined" ? 'Question' : "Question to Rephrase"}
                    type='text'
                    fullWidth
                    value={userQuestion}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                    onChange={(e) => {setUserQuestion(e.target.value)}}/> 
                </Box> : null}

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                {workspace && renderFinalButton()}
            </Box>

            {questions.length > 0 ? <Box sx={{ mt: 2}}>
                <small style={{color: "#0F172A", display: "flex", justifyContent: "flex-end"}}>Note: Please validate SQL to enable testcase creation</small>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <DataGrid
                        rows={questions}
                        columns={[{
                                field: 'question',
                                headerName: 'Questions',
                                headerAlign: "center",
                                align: "center",
                                // editable: true,
                                flex: 2,
                            }, {
                                field: 'sql',
                                headerName: 'SQL',
                                headerAlign: "center",
                                align: "center",
                                // editable: true,
                                // renderCell: (params) => {
                                //     return <p>{params.row.sql}</p>
                                // },
                                // renderEditCell: (params) => (
                                //     <textarea
                                //         value={params.value}
                                //         onChange={(event) => {
                                //             params.api.setEditCellValue({id: params.id, field: 'sql', value: event.target.value});
                                //         }}
                                //         onBlur={() => {
                                //             params.api.stopCellEditMode({id: params.id, field: 'sql'});
                                //         }}
                                //         style={{ width: '100%', height: '100%' }}
                                //     />
                                // ),
                                flex: 3,
                            }, {
                                headerName: 'Actions',
                                field: 'action',
                                flex: 1,
                                headerAlign: "center",
                                align: "center",
                                renderCell: (params) => {
                                    return (
                                    <Box>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                        {/* <Tooltip arrow placement="left" title="Edit" PopperProps={{ disablePortal: true }}>
                                            <IconButton
                                            className="color-icon"
                                            onClick={(event) => {
                                                // handleEditTestCase(params.row, event)
                                                }}
                                            >
                                            <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip> */}
                                        {/* <Button size="small" style={{margin: "2px"}} variant="contained">Edit</Button>
                                        <Button size="small" style={{margin: "2px"}} variant="contained">Validate SQL</Button> */}
                                            <Stack direction="column" spacing={1}>
                                                <Chip onClick={(e) => {
                                                        e.preventDefault(); 
                                                        setOpenEditTestcaseModal(true);
                                                        setEditingTestcase(params.row);
                                                    }} label="Edit" />
                                                <Chip 
                                                    sx={{
                                                        backgroundColor: params.row.isSqlValid !== "Not Validated" ? (params.row.isSqlValid === "Valid" ? "green" : "red") : "", 
                                                        color: params.row.isSqlValid !== "Not Validated" ? "white" : "",
                                                        cursor: params.row.isSqlValid === "Valid" ? "not-allowed" : "pointer"
                                                    }} 
                                                    label="Validate SQL" 
                                                    onClick={(e) => {
                                                        if(params.row.isSqlValid === "Valid"){
                                                            return;
                                                        }
                                                        e.preventDefault(); 
                                                        validateSql(params.row);
                                                    }}/>
                                            </Stack>
                                        </div>
                                    </Box>
                                    );
                                },
                            }, {
                                field: 'status',
                                headerAlign: "center",
                                align: "center",
                                headerName: 'Status',
                                flex: 1,
                                renderCell: (param) => {
                                    return (
                                        <Tooltip title={param.row.message}>
                                            <span
                                            variant="outlined"
                                            style={{
                                                borderRadius: "20px",
                                                border: "0",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                            >
                                                <CustomStatus status={param.row.status} color={getStatusColor(param.row.status)} />
                                            </span>
                                        </Tooltip>
                                    );
                                },
                            }
                        ]}
                        // onProcessRowUpdateError={() => {
                            
                        // }}
                        // processRowUpdate={(updatedRow, originalRow) => {
                            
                        //     const newQuestions = [...questions.map(q => {
                        //         if(q.id === updatedRow.id) { 
                        //             return {
                        //                 ...updatedRow,
                        //                 isSqlValid: "Not Validated"
                        //             }
                        //         } else {
                        //             return q;
                        //         }
                        //     })]
                        //     setQuestions(newQuestions);
                        //     apiRef.current.stopRowEditMode({ id: updatedRow.id });
                        //     apiRef.current.refreshCells();
                        //     apiRef.current.reflow();
                        // }}
                        // onCellEditStop={(params) => {
                            
                        //     apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
                        //     // apiRef.current.refreshCells();
                        //     // apiRef.current.reflow();
                            
                        // }}
                        checkboxSelection
                        disableRowSelectionOnClick
                        hideFooter
                        isRowSelectable={(params) => params.row.isSqlValid === "Valid" && params.row.status !== "Created"}
                        onRowSelectionModelChange={(newSelectionModel) => {
                            const selectedIds = newSelectionModel.ids 
                                ? Array.from(newSelectionModel.ids) 
                                : newSelectionModel;
                            setSelectedTestcases(selectedIds); 
                        }}
                        apiRef={apiRef}
                        getRowHeight={() => 'auto'}
                        sx={{ 
                            minHeight: 250,
                            '& .MuiDataGrid-cell': {
                                whiteSpace: "normal !important",
                                wordWrap: "break-word !important",
                                paddingTop: "10px",
                                paddingBottom: "10px",
                                display: "flex",
                                alignItems: "center", // <-- This aligns cell content vertically center
                            }
                        }}
                    />
                </Box>
            </Box> : null }

            {questions.length > 0 && irisDatabase !== "" && workspace !== "" && <Grid item xs={12} sx={{display: "flex", justifyContent: "flex-end", marginTop: "20px"}}>
                <Button sx={{ background: "#0ea5e9 !important", color: "white", marginRight: "5px"}}onClick={() => createExcelAndDownload()}>Download Test Case</Button>
            </Grid>}
            {selectedTestcases.length > 0 && <>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                    {/* Test Suite */}
                    <FormControl variant={"standard"}>
                        <InputLabel sx={{
                            // Apply custom styles for the label positioning
                            transform: 'translate(14px, 12px) scale(1)', 
                            // Shrink the label and move it to the top when focused/filled
                            '&.MuiInputLabel-shrink': { 
                                transform: 'translate(14px, -6px) scale(0.75)', 
                                backgroundColor: 'white',  // Set background color to white when label is shrunk
                                padding: '0 4px', // Optional: Adds some padding around the shrunk label
                                zIndex: 1, // Ensure the label appears above the text field
                            }
                            }}>Test Suite</InputLabel>
                        <Select
                            name="testSuiteId"
                            size="small"
                            variant="outlined"
                            sx={{
                                width: "300px"
                            }}
                            required
                            value={testSuiteValue}
                            onChange={(e) => {setTestSuiteValue(e.target.value);}}
                            onClose={() => setSearchTestSuite("")}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                        overflowY: "auto",
                                    },
                                },
                                autoFocus: false,
                            }}
                            renderValue={(selected) => {
                                return typeof selected === "object" && selected !== null
                                    ? selected.name // If the selected value is an object, return its name
                                    : testSuitInfo.find((option) => option?.id === selected)?.name ;
                            }}
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
                                            <Search />
                                        </InputAdornment>
                                        ),
                                    }}
                                />
                            </ListSubheader>
                            {displayedOptions.map((option) => (
                                <MenuItem
                                    key={option?.id}
                                    value={option?.id === -1 ? option?.name : option?.id}
                                    onClick={() => {
                                        if (option?.id === -1) {
                                            setTestSuiteDialogOpen(true);
                                        }
                                    }}
                                >
                                    {option?.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {/* <FormHelperText>{getHelperText(index, "testSuiteId")}</FormHelperText> */}
                    </FormControl> 
                   
                    {/* Test Type Select */}
                    <Box>
                        
                        {["Similarity", "Consistency", "Accuracy", "SQL Validation", "Summary"]
                        .filter(tt => { 
                            if(tt === "Similarity" || tt === "Accuracy") {
                                return false
                            } else {
                                return true
                            }
                        })
                        .map((tt, idx) => (
                            <FormControlLabel
                                key={idx}
                                control={
                                    <Checkbox
                                    checked={testType.includes(tt)}
                                    onChange={(e) => handleTestTypeChange(e, tt)}
                                    />
                                }
                                label={tt}
                                name="test_type"
                                />
                        ))}
                    </Box>
                </Box>
                {/* Iteration Select */}
                <Box sx={{ mt: 2 }}>
                    {testType?.includes("Consistency") && (
                        <Grid item xs={8} sx={{ textAlign: "right" }}>
                            <Box display="flex">
                            <FormControl variant="standard">
                                <TextField
                                    variant="outlined"
                                    select
                                    label="Select Iteration"
                                    sx={{
                                        width: "300px"
                                    }}
                                    fullWidth
                                    size="small"
                                    name="iteration"
                                    value={iteration}
                                    onChange={(e) => {setIteration(e.target.value)}}
                                >
                                    <MenuItem value={2}>2</MenuItem>
                                    <MenuItem value={3}>3</MenuItem>
                                    <MenuItem value={4}>4</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                </TextField>
                            </FormControl>
                            </Box>
                        </Grid>
                    )}
                </Box>
                {/* Create Test Case Button */}
                <Grid item xs={12} sx={{
                    display: 'flex',           
                    justifyContent: 'center',  
                    alignItems: 'center',      
                    gap: 2
                }}>
                    {testSuiteValue !== "" && <>
                        <Button sx={{
                            background: "#0ea5e9 !important", 
                            color: "white", 
                            marginRight: "5px"
                        }}
                        onClick={createTestcaseHandler}>Create Test Case</Button> 
                        
                        <Button sx={{background: "#0ea5e9 !important", color: "white"}} onClick={handleReset}>Reset</Button> 
                    </>}
                </Grid>
            </>}
        
        </Box>
        
        <Dialog open={openDoubleConfirm} onClose={handleCloseDoubleConfirm}>
            <DialogTitle>Please specify the number of questions to be generated.</DialogTitle>
            <DialogContent>
                <TextField
                    sx={{ marginTop: '20px' }}
                    label='No. of Question'
                    type='number'
                    InputProps={{ inputProps: { min: 5, max: 10 } }}
                    value={numberofQuestions}
                    fullWidth
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                    onChange={(e) => {setNumberOfQuestions(e.target.value)}}
                />
                <DialogContentText>
                    <small>Note: A minimum of 5 and maximum of 10 questions can be generated.</small>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDoubleConfirm}>Close</Button>
                <Button onClick={() => generateQuestion(false)} autoFocus>Generate</Button>
            </DialogActions>
        </Dialog>

        <TestSuiteDialog
            open={testSuiteDialogOpen} 
            handleClose={() => {
                setTestSuiteDialogOpen(false);
                setIsRequired(false)}
            } 
            saveTestSuite={saveTestSuite} 
            title="Create Test Suite" 
            isRequired={isRequired} 
            testSuiteDetailes={testSuiteDetailes}
            setTestSuiteDetailes={setTestSuiteDetailes}
            setIsRequired={setIsRequired}/>

        <EditTestCaseModal 
            openEditTestcaseModal={openEditTestcaseModal}
            setOpenEditTestcaseModal={setOpenEditTestcaseModal}
            setEditingTestcase={setEditingTestcase}
            editingTestcase={editingTestcase}
            questions={questions}
            setQuestions={setQuestions}
        />
    </>
}

export default TestCaseQuestionGenerate;

const EditTestCaseModal = ({openEditTestcaseModal, setOpenEditTestcaseModal, setEditingTestcase, editingTestcase, setQuestions, questions}) => {
    const [question, setQuestion] = useState("");
    const [sql, setSql] = useState("");
    
    useEffect(() => {
        if(editingTestcase !== null){
            setQuestion(editingTestcase.question)
            setSql(editingTestcase.sql)
        }
    }, [editingTestcase])

    const updateTestcase = () => {
        setQuestions([...questions.map(q => {
            if(q.id === editingTestcase.id){
                return {
                    ...q,
                    question,
                    sql,
                    isSqlValid: "Not Validated"
                }
            } else {
                return q
            }
        })]);
        setEditingTestcase(null);
        setOpenEditTestcaseModal(false)
    }
    
    return <Modal
        open={openEditTestcaseModal}
        onClose={() => {setOpenEditTestcaseModal(false); setEditingTestcase(null)}}
        >
        <Box sx={{ ...styleModal, width: 400 }}>
            <h3 >Update Testcase</h3>
            <form>
                <TextField
                    id="question"
                    label="Question"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    id="sql"
                    label="SQL"
                    value={sql}
                    onChange={e => setSql(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                />
                <Grid item style={{display: "flex", justifyContent: "right", gap: "5px"}}>
                    <Button variant="contained" color="primary" onClick={updateTestcase}>Update</Button>
                    <Button variant="outlined" color="primary" onClick={() => {setOpenEditTestcaseModal(false); setEditingTestcase(null)}}>Close</Button>
                </Grid>
            </form>
        </Box>
    </Modal>
}
