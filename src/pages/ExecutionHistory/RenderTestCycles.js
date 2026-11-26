import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Box,
  Tooltip,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  TextField
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AddCircle, DoDisturb, MoreVert, Visibility, WrapText } from "@mui/icons-material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { useEffect, useRef, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import * as classes from "./ExecutionHistory.module.css";
import ViewTestCaseDetailDialog from "../../components/viewTestCaseDetailDialog/ViewTestCaseDetailDialog";
import ViewTestCaseLogDialog from "./ViewTestCaseLogDialog";
import { FALCON_API } from "../../../environment";
import { getDataFromStorage } from "../../utils/utility";
import {
  useCreateJaasIssueMutation,
  useExecuteTestCaseMutation,
  useGetJaasProjectsMutation,
  useGetTestCasesExecutionListMutation,
  useViewJaasStatusMutation
} from "../../store/mdtSlice";
import { useDispatch, useSelector } from "react-redux";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import ConfirmDialogWithReason from "../TestCase/ConfirmDialogWithReason";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { redirectToLogin } from "../../store/apiSlice";

export const CustomStatus = ({ status, color }) => {
    return (
      <Typography
        style={{
          	backgroundColor: color,
			textAlign: "center",
        }}
        className={classes.status}
      >
        {status}
      </Typography>
    );
};

export const getStatusColor = (status) => {	
    switch (status) {
		case "Success":
			return "#3fb802";
		case "Pass":
			return "#3fb802";
		case "Running":
			return "#3fb802";
		case "Fail":
			return "red";
		case "Fail due to API Issue":
			return "red";
		case "Not Executed":
			return "#2980B9";
		case "Force Stop":
			return "#ffa500";
		case "Force Success":
			return "green";
		case "Force Pass":
			return "green";
		case "Force Fail":
			return "#8B0000";
		case "Ignored":
			return "#808080";
		case "Skipped":
			return "#12c2f7ff";
		default:
			return "black";
    }
};

export const RenderTestCycles = ({
    // filterTestCycles, 
    testCycleListData, 
    page,
    pageSize, 
    loading, 
    handleAccordionClick,
    openedAccordion,
	openedTestCycle,
    testCasesListData,
	setTestCasesListData,
    handleOpenDialog,
    openSqlQueryDialog,
    handleFetchTestCaseReport,
    handleFetchTestCycleReport,
    handleViewPastExecution,
    showViewPastOption,
	noRowsLabel
}) => {
	const dispatch = useDispatch();

    const [selectedTestCaseRow, setSelectedTestCaseRow] = useState([]);
    const [openViewTestCaseDetailModal, setOpenViewTestCaseDetailModal] = useState(false);
	const [openViewTestCaseLogModal, setOpenViewTestCaseLogModal] = useState(false);
    const [selectedTestCaseDetail, setSelectedTestCaseDetail] = useState(null);
	const [selectedTestCaseLog, setSelectedTestCaseLog] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElTestcase, setAnchorElTestcase] = useState(null);
	const [currentTestCycle, setCurrentTestCycle] = useState(null);
	const [currentTestCycleForJaasIssue, setCurrentTestCycleForJaasIssue] = useState(null);
	const [currentTestcase, setCurrentTestcase] = useState(null);
	const [openCreateJaasIssueModal, setOpenCreateJaasIssueModal] = useState(false);
	const [openViewJaasIssueModal, setOpenViewJaasIssueModal] = useState(false);
	const [openViewMultiStepsModal, setOpenViewMultiStepsModal] = useState(false);
	const [selectedMultiStepData, setSelectedMultiStepData] = useState([]);

	const [changeStatus, setChangeStatus] = useState(undefined);
	const [openDoubleConfirm, setOpenDoubleConfirm] = useState(false);

	const { selectedOrgAppDetails } = useSelector((state) => state.data);

	const [getTestCasesExecutionList] = useGetTestCasesExecutionListMutation();
	const [executeTestCase] = useExecuteTestCaseMutation();

	const open = Boolean(anchorEl);
	const openTestcase = Boolean(anchorElTestcase);

    const handleClick = (event) => {
      event.stopPropagation();
    };

    if (loading) {
      return (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          Loading...
        </Typography>
      );
    }

    if (!loading && testCycleListData.length === 0) {
      return (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          No Execution History found for the given Organization and Application.
        </Typography>
      );
    }

    const getRowClassName = (params) => {
        return params.indexRelativeToCurrentPage % 2 === 0 ? classes["bg-white"] : classes["bg-light-green"];
    };

    const handleViewTestCaseDetail = (rowData) => {
      setOpenViewTestCaseDetailModal(true);
      setSelectedTestCaseDetail(rowData)
    }

    const tableColumns = [
        {
          field: "test_case_id",
          headerName: "Test Case Id",
          flex: 3,
          // headerClassName: classes["header"],
          headerAlign: "center",
          align: "center",
        },
        {
          field: "test_case_name",
          headerName: "Test Case Name",
          flex: 3,
          // headerClassName: classes["header"],
          headerAlign: "center",
          align: "center",
        },
		{
			field: "test_suite_name",
			headerName: "Test Suite Name",
			flex: 3,
			headerAlign: "center",
          	align: "center",
		},
		{
			field: "source_sql",
			headerName: "Type",
			flex: 1,
			headerAlign: "center",
		  	align: "center",
			renderCell: (params) => {				
				// if (params.row.execution_engine) {
				// 	const sourceQuery = JSON.parse(params.row.source_query);
				// 	const type = sourceQuery?.execution_engine || "Data Test Case";
				// 	return type;
				// } else {
				// 	return "Unknown";
				// }
				return (params.row.execution_engine && params.row.execution_engine !== "") ? params.row.execution_engine : "Data Test Case";
			}
		},
        {
          field: "execution_message",
          headerName: "Execution Message",
          flex: 3,
          // headerClassName: classes["header"],
          headerAlign: "center",
          align: "center",
          renderCell: (params) => {
            const { value } = params;
            const query = value;
            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Tooltip
                  title={
                    !openSqlQueryDialog && (
                      <Typography style={{ cursor: "pointer", fontSize: "12px" }} onClick={() => handleOpenDialog(params.row.execution_message, "Execution Message")} variant="h6">
                        {"view more"}
                      </Typography>
                    )
                  }
                  placement="top"
                  arrow
                >
                  <span
                    style={{
                      maxWidth: "86px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {query}
                  </span>
                </Tooltip>
              </div>
            );
          },
        },
        {
          field: "Actions",
          headerName: "Actions",
          flex: 2,
          // headerClassName: classes["header"],
          headerAlign: "center",
          align: "center",
          sortable: false,
          renderCell: (params) => (
            <div>
				<Tooltip title="View More Options" Props={{ disablePortal: true }}>
					<IconButton 
						className="color-icon" 
						onClick={(event) => {event.stopPropagation(); handleViewMoreOptionTestCases(event, params.row)}}>
						<MoreVert />
					</IconButton>
				</Tooltip>
            </div>
          ),
        },
        {
          field: "status",
          headerName: "Status",
          flex: 3,
          // headerClassName: classes["header"],
          headerAlign: "center",
          align: "center",
          renderCell: (param) => {
            return (
              <span
                variant="outlined"
                style={{
                  borderRadius: "20px",
				  marginTop: "4px",
                  border: "0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CustomStatus status={param.row.status} color={getStatusColor(param.row.status)} />
              </span>
            );
          },
        },
    ];

	const handleTestCycleStatusChange = (testCycle, status, reason) => {		
		fetch(`${FALCON_API}/test-cycle`, {
				method: "POST",
				body: JSON.stringify({
					function_name: "mdt-change-status",
					justification: reason,
					test_cycle_result_id: testCycle.test_cycle_result_id,
					status, 
          			user_id: sessionStorage.getItem("username"),
				}),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getDataFromStorage("token")}`,
				},
			}
		)
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
			if(response.statusCode === 200){				
				setTestCasesListData(testCasesListData.map(tcld => {
					if(testCycle.test_cycle_result_id === tcld.test_cycle_result_id){
						return {
							...tcld,
							status
						}
					}
					return tcld
				}))
			}
			setChangeStatus(undefined);
		});
	}

	const handleTestCaseStatusChange = (testcase, status, reason) => {	
			
		fetch(`${FALCON_API}/test-cycle`, {
				method: "POST",
				body: JSON.stringify({
					function_name: "mdt-change-status",
					justification: reason,
					tc_result_id: testcase.test_case_result_id,
					status, 
          			user_id: sessionStorage.getItem("username"),
				}),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getDataFromStorage("token")}`,
				},
			}
		)
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
			if(response.statusCode === 200){
				setTestCasesListData([...testCasesListData.map(tcld => {
					if(testcase.test_case_result_id === tcld.test_case_result_id){
						return {
							...tcld,
							status
						}
					}
					return tcld
				})])
			}
			setChangeStatus(undefined);
		}).catch((error) => {
			console.error("Error changing test case status:", error);
		})
	}

	const onDoubleConfirm = (reason) => {
		if(changeStatus.type === "cycle"){			
			handleTestCycleStatusChange(changeStatus.data, changeStatus.status, reason)
		} else if(changeStatus.type === "case"){
			handleTestCaseStatusChange(changeStatus.data, changeStatus.status, reason)
		}
		setOpenDoubleConfirm(false);
	}
	
	const onCancelDoubleConfirm = () => {
		setOpenDoubleConfirm(false);
		setChangeStatus(undefined)
	}

	const handleRerunTestcase = async (testcase) => {
		try {
			const { data } = await executeTestCase({
				function_name: "execute",
				service: "test_case_execution",
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env: "dev",
				test_cycle_id: openedTestCycle?.test_cycle_id,
				test_cycle_name: openedTestCycle?.test_cycle_name,
				test_cases: [{
					test_case_id: testcase.test_case_id,
					test_case_name: testcase.test_case_name,
					test_suite_name: testcase.test_suite_name,
					test_suite_id: testcase.test_suite_id
				}],
				user_id: sessionStorage.getItem("username"),
				// token: getDataFromStorage("token"),
			});
			if (data && data.statusCode === 200) {
				dispatch(
					showSnackbar({
						message: data?.message,
						className: "color-success-background width-50",
					})
				);
			}
			if (!!error) throw error;
		} catch (error) {
			console.error("Error fetching test cases execution list:", error);
		}
	}

	const handleRerunTestcycle = async (testCycle) => {
		try {
			dispatch(showLoading());
			const { data: response, error } = await getTestCasesExecutionList({
			  test_cycle_result_id: testCycle.test_cycle_result_id,
			  user_id: sessionStorage.getItem("username"),
			  function_name: "get-test-case-executions",
			});

			if (response && response.data && response.statusCode === 200) {
			  const testCases = response.data.test_cases.map((item) => ({
				test_case_id: item.test_case_id,
                test_case_name: item.test_case_name,  
				test_suite_name: item.test_suite_name,
				test_suite_id: item.test_suite_id
			  }));

			  	if(testCases.length === 0){
					dispatch(closeLoading());
					dispatch(
						showSnackbar({
							message: "No test cases found to rerun in this test cycle.",
							className: "color-error-background width-50",
						})
					);
				} else {
			  
					const { data } = await executeTestCase({
						function_name: "execute",
						service: "test_case_execution",
						domain_name: selectedOrgAppDetails.orgName,
						sub_domain_name: selectedOrgAppDetails.appName,
						env: "dev",
						test_cycle_id: testCycle?.test_cycle_id,
						test_cycle_name: testCycle?.test_cycle_name,
						test_cases: testCases,
						user_id: sessionStorage.getItem("username"),
						// token: getDataFromStorage("token"),
					});
					if (data && data.statusCode === 200) {
						dispatch(
							showSnackbar({
								message: data?.message,
								className: "color-success-background width-50",
							})
						);
					}
				}

			}
			dispatch(closeLoading());
			if (!!error) throw error;
		} catch (error) {
			dispatch(closeLoading());
			console.error("Error fetching test cases execution list:", error);
		}
	}

	const handleStopExecution = async (event, testcycle) => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/execute-operations`, {
			method: "POST",
			body: JSON.stringify({
				function_name: "mdt-stop-execution",
				test_cycle_result_id: testcycle.test_cycle_result_id,
				test_cycle_id: testcycle.test_cycle_id,
				user_id: sessionStorage.getItem("username"),
			}),
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
		.then((response) => {
			dispatch(closeLoading());
			if(response.statusCode === 200){				
				setTestCasesListData(testCasesListData.map(tcld => {
					if(testcycle.test_cycle_result_id === tcld.test_cycle_result_id){
						return {
							...tcld,
							status: "Force Stop"
						}
					}
					return tcld
				}))

			}
		});
	}

	const handleViewMultiSteps = (currentTestcase) => {
		if (currentTestcase?.multi_step_results && Array.isArray(currentTestcase.multi_step_results)) {
			setSelectedMultiStepData(currentTestcase.multi_step_results);
			setOpenViewMultiStepsModal(true);
		}
	}

	const handleViewLogs = (currentTestcase) => {		
		dispatch(showLoading());
		fetch(`${FALCON_API}/test-case`, {
			method: 'POST',
			body: JSON.stringify({
				function_name: "get-test-execution-logs",
				user_id: sessionStorage.getItem("username"),
				test_result_id: currentTestcase.test_case_result_id,
				test_case_id: currentTestcase.test_case_id
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
		})
		.then((response) => {			
			if (response.status === 401) {
				// Unauthorized, redirect to login
				redirectToLogin();
				return;
			}
			return response.json();
		})
		.then((response) => {			
			if(response && response.body && response.statusCode === 200){
				const logs = JSON.parse(response.body)?.data;
				setSelectedTestCaseLog(logs)
				setOpenViewTestCaseLogModal(true);
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	}

	const viewMoreOptions = () => {				
		return <Menu
		  anchorEl={anchorEl}
		  id="account-menu"
		  open={open}
		  onClose={handleCloseMoreOption}
		  onClick={handleCloseMoreOption}
		  slotProps={{
			paper: {
			  elevation: 0,
			  sx: {
				overflow: 'visible',
				filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
				mt: 1.5,
				'& .MuiAvatar-root': {
				  width: 32,
				  height: 32,
				  ml: -0.5,
				  mr: 1,
				},
				'&::before': {
				  content: '""',
				  display: 'block',
				  position: 'absolute',
				  top: 0,
				  right: 14,
				  width: 10,
				  height: 10,
				  bgcolor: 'background.paper',
				  transform: 'translateY(-50%) rotate(45deg)',
				  zIndex: 0,
				},
			  },
			},
		  }}
		  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
		  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
		>
			<MenuItem 
				style={{cursor: currentTestCycle?.status === "Running" ? "not-allowed" : "pointer"}}
				onClick={(event) => {
					if(currentTestCycle.status !== "Running"){
						handleFetchTestCycleReport(event, currentTestCycle);
						handleCloseMoreOption();
					}
				}}>
				<CloudDownloadOutlinedIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Download
			</MenuItem>
			{showViewPastOption ? <MenuItem onClick={(event) => {handleViewPastExecution(event, currentTestCycle.test_cycle_id); handleCloseMoreOption();}}>
				<Visibility fontSize="small" sx={{mr: "5px"}} className="color-icon" /> View Past Exec
			</MenuItem> : null}
			{currentTestCycle?.status === "Running" ? <MenuItem 
				onClick={(event) => {
					handleStopExecution(event, currentTestCycle);
					handleCloseMoreOption();
				}}>
				<DoNotDisturbAltIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Stop Execution
			</MenuItem> : null}
			{currentTestCycle?.status === "Fail" ? <MenuItem 
				onClick={() => {
					setOpenCreateJaasIssueModal(true);
					handleAccordionClick(currentTestCycle, true);
					handleCloseMoreOption();
					setCurrentTestCycleForJaasIssue(currentTestCycle);
				}}>
				<AddCircle fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Create Jaas Issue
			</MenuItem> : null}
			{currentTestCycle?.issue_created ? <MenuItem 
				onClick={() => {
					setOpenViewJaasIssueModal(true);
					handleAccordionClick(currentTestCycle, true); 
					handleCloseMoreOption();
				}}>
				<VisibilityOutlinedIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> View Jaas Issue
			</MenuItem> : null}
      		{currentTestCycle?.status === "Fail" ? <MenuItem 
				onClick={() => {
					setChangeStatus({type: "cycle", data: currentTestCycle, status: "Success"});
					setOpenDoubleConfirm(true);
					handleCloseMoreOption();
				}}>
				<CheckCircleIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Mark as Success
			</MenuItem> : null}
			{currentTestCycle?.status === "Success" ? <MenuItem 
				onClick={() => {
					setChangeStatus({type: "cycle", data: currentTestCycle, status: "Fail"});
					setOpenDoubleConfirm(true);
					handleCloseMoreOption();
				}}>
				<DangerousIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Mark as Failed
			</MenuItem> : null}
			{currentTestCycle?.status !== "Running" ? <MenuItem 
				onClick={() => {
					handleRerunTestcycle(currentTestCycle);
					handleCloseMoreOption();
				}}>
				<DirectionsRunIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Rerun
			</MenuItem>  : null}
		</Menu>
	}

	const getDateDiffInWords = (date1String, date2String) => {
		if (date1String === "None" || date2String === "None") {
		  return "N/A";
		}
	  
		const date1 = new Date(date1String);
		const date2 = new Date(date2String);
	  
		const diff = Math.abs(date2.getTime() - date1.getTime());
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
	  
		let timeDiff = "";
	  
		if (days > 0) {
		  timeDiff += `${days}d`;
		}
	  
		const remainingHours = hours % 24;
		if (remainingHours > 0) {
		  if (timeDiff !== "") {
			timeDiff += " ";
		  }
		  timeDiff += `${remainingHours}h`;
		}
	  
		const remainingMinutes = minutes % 60;
		if (remainingMinutes > 0) {
		  if (timeDiff !== "") {
			timeDiff += " ";
		  }
		  timeDiff += `${remainingMinutes}m`;
		}
	  
		const remainingSeconds = seconds % 60;
		if (remainingSeconds > 0) {
		  if (timeDiff !== "") {
			timeDiff += " ";
		  }
		  timeDiff += `${remainingSeconds}s`;
		}
	  
		return timeDiff;
	}

	const getPassPercentage = (totalTestCases, passedTestCases) => {
		if(totalTestCases !== null && passedTestCases !== null){
			let val = ((passedTestCases/totalTestCases) * 100).toFixed(0);
			if(!isNaN(val)){
				return <Tooltip title={<><p>Total Pass: {passedTestCases}</p><p>Total Fail: {totalTestCases-passedTestCases}</p></>}>{`${val}%`}</Tooltip>
			}
			
		}
	}

	const viewMoreOptionsTestcase = () => {
		return <Menu
		  anchorEl={anchorElTestcase}
		  id="account-menu"
		  open={openTestcase}
		  onClose={handleCloseMoreOption}
		  onClick={handleCloseMoreOption}
		  slotProps={{
			paper: {
			  elevation: 0,
			  sx: {
				overflow: 'visible',
				filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
				mt: 1.5,
				'& .MuiAvatar-root': {
				  width: 32,
				  height: 32,
				  ml: -0.5,
				  mr: 1,
				},
				'&::before': {
				  content: '""',
				  display: 'block',
				  position: 'absolute',
				  top: 0,
				  right: 14,
				  width: 10,
				  height: 10,
				  bgcolor: 'background.paper',
				  transform: 'translateY(-50%) rotate(45deg)',
				  zIndex: 0,
				},
			  },
			},
		  }}
		  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
		  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
		>
			<MenuItem onClick={(event) => {
				handleFetchTestCaseReport(currentTestcase.test_case_result_id, event);
				handleCloseMoreOption();
			}}>
				<CloudDownloadOutlinedIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Download
			</MenuItem>
			<MenuItem onClick={() => {
				handleViewTestCaseDetail(currentTestcase);
				handleCloseMoreOption();
			}}>
				<VisibilityOutlinedIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> View
			</MenuItem>
			<MenuItem onClick={(event) => {
				handleFetchTestCaseReport(currentTestcase.test_case_result_id, event, true);
				handleCloseMoreOption();
			}}>
				<DescriptionIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> View Test Case Report
			</MenuItem>
			{currentTestcase?.status === "Fail" ? <MenuItem onClick={() => {
				handleViewLogs(currentTestcase);
				handleCloseMoreOption();
			}}>
				<SummarizeIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> View Logs
			</MenuItem> : null}
			{currentTestcase?.is_multi_step_enabled ? <MenuItem onClick={() => {
				handleViewMultiSteps(currentTestcase);
				handleCloseMoreOption();
			}}>
				<WrapText fontSize="small" sx={{mr: "5px"}} className="color-icon" /> View Baseline (Multi-step)
			</MenuItem> : null}
			{currentTestcase?.status === "Pass" || currentTestcase?.status === "Ignored" ? <MenuItem 
				onClick={() => {
					setChangeStatus({data: currentTestcase, type: "case", status: "Force Fail"});
					setOpenDoubleConfirm(true);
					handleCloseMoreOption();
				}}>
				<DangerousIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Mark as Failed
			</MenuItem> : null}
			{currentTestcase?.status === "Fail" || currentTestcase?.status === "Ignored" ? <MenuItem 
				onClick={() => {
					setChangeStatus({data: currentTestcase, type: "case", status: "Force Pass"});
					setOpenDoubleConfirm(true);
					handleCloseMoreOption();
				}}>
				<CheckCircleIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Mark as Passed
			</MenuItem> : null}
			{currentTestcase?.status !== "Running" && currentTestcase?.status !== "Ignored"? <MenuItem 
				onClick={() => {
					setChangeStatus({data: currentTestcase, type: "case", status: "Ignored"});
					setOpenDoubleConfirm(true);
					handleCloseMoreOption();
				}}>
				<DoDisturb fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Mark as Ignored
			</MenuItem> : null}
			{currentTestcase?.status !== "Running" ? <MenuItem 
				onClick={() => {
					handleRerunTestcase(currentTestcase);
					handleCloseMoreOption();
				}}>
				<DirectionsRunIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Rerun
			</MenuItem> : null}
		</Menu>
	}

	const handleViewMoreOption = (event, testCycle) => {
		event.stopPropagation();
	  	setCurrentTestCycle(testCycle);
		setAnchorEl(event.currentTarget);
  	};

	const handleViewMoreOptionTestCases = (event, testcase) => {
		event.stopPropagation();
		setCurrentTestcase(testcase);
		setAnchorElTestcase(event.currentTarget);
	}

	const handleCloseMoreOption = () => {
		setAnchorEl(null);
	  	setCurrentTestCycle(null);
		setAnchorElTestcase(null);
		setCurrentTestcase(null);
  	};

    return <>
		{viewMoreOptions()}
		{viewMoreOptionsTestcase()}
		<ViewTestCaseDetailDialog 
			open={openViewTestCaseDetailModal}
			setOpen={setOpenViewTestCaseDetailModal}
			selectedTestCaseDetail={selectedTestCaseDetail}
			handleClose={() => {
				setOpenViewTestCaseDetailModal(false);
				setSelectedTestCaseDetail(null);
			}}/>

		<ViewTestCaseLogDialog 
			open={openViewTestCaseLogModal}
			setOpen={setOpenViewTestCaseLogModal}
			selectedTestCaseLog={selectedTestCaseLog}
			handleClose={() => {
				setOpenViewTestCaseLogModal(false);
				setSelectedTestCaseLog([]);
			}}/>

		<ViewMultiStepsModal 
			open={openViewMultiStepsModal}
			setClose={() => setOpenViewMultiStepsModal(false)}
			multiStepData={selectedMultiStepData}
		/>

		<CreateJaasIssueModal 
			open={openCreateJaasIssueModal}
			setClose={() => {setOpenCreateJaasIssueModal(false); setCurrentTestCycleForJaasIssue(null);}}
			testCases={testCasesListData}
			currentTestCycleForJaasIssue={currentTestCycleForJaasIssue}
			/>

		<ConfirmDialogWithReason 
			open={openDoubleConfirm}
			onConfirm={onDoubleConfirm} 
			onCancel={onCancelDoubleConfirm}/>

		<ViewJaasIssueModal 
			open={openViewJaasIssueModal}
			setClose={() => setOpenViewJaasIssueModal(false)}
			testCases={testCasesListData}/>

		{testCycleListData.map((testCycle, index) => (
			<Accordion
				key={index}
				onClick={() => {handleAccordionClick(testCycle); setTestCasesListData(testCycle.test_cases)}}
				expanded={openedAccordion === testCycle.test_cycle_result_id}
				disableGutters
				sx={{
					"&:before": {
					display: "none",
					},
				}}
				style={{
					border: "1px solid #e0e0e0",
					boxShadow: "none",
					marginBottom: "10px",
					borderRadius: "8px",
				}}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					style={{
						backgroundColor: index % 2 === 0 ? "#f2f2f2" : "",
						borderRadius: "8px",
					}}
				>
					<Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						{showViewPastOption ?
						<>
							<Box sx={{ width: "8%", padding: "2px", textAlign: "center" }}>
								<Typography className={classes["testcycle-header"]} variant="subtitle2">
									{testCycle.test_cycle_id}
								</Typography>
							</Box>
							<Box sx={{ width: "16%", padding: "2px", textAlign: "center", wordBreak: "break-word" }}>
								<Typography className={classes["testcycle-header"]} variant="subtitle2">
									{testCycle.test_cycle_name}
								</Typography>
							</Box>
						</>
						: null}
						<Box sx={{ width: "16%", padding: "2px", textAlign: "center" }}>
							<Typography className={classes["testcycle-header"]} variant="subtitle2">
								{testCycle.time_stamp}
							</Typography>
						</Box>
						<Box sx={{ width: "16%", padding: "2px", textAlign: "center" }}>
							<Typography 
								sx={{ 
									wordBreak: "break-word",
								}} 
								className={classes["testcycle-header"]} 
								variant="subtitle2">
								{testCycle.user_id}
							</Typography>
						</Box>
						<Box sx={{ width: "8%", padding: "2px", textAlign: "center" }}>
							<Typography className={classes["testcycle-header"]} variant="subtitle2">
								{testCycle.status === "Fail" || testCycle.status === "Success" ? getDateDiffInWords(testCycle.end_ts, testCycle.start_ts) : "N/A"}
							</Typography>
						</Box>
						<Box sx={{ width: "8%", padding: "2px", textAlign: "center" }}>
							<Typography className={classes["testcycle-header"]} variant="subtitle2">
								{testCycle.status !== "Running" ? getPassPercentage(testCycle.total_test_case_count, testCycle.total_pass_count) : "0%"}
							</Typography>
						</Box>
						<Box sx={{ width: "8%", padding: "2px", textAlign: "center" }}>
							<Typography className={classes["testcycle-header"]}>
								<Tooltip title="View More Options" Props={{ disablePortal: true }}>
									<IconButton 
										className="color-icon" 
										onClick={(event) => {event.stopPropagation(); handleViewMoreOption(event, testCycle)}}>
										<MoreVert />
									</IconButton>
								</Tooltip>
							</Typography>
						</Box>
						<Box sx={{ width: "16%", padding: "2px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<CustomStatus status={testCycle.status} color={getStatusColor(testCycle.status)} />
						</Box>
					</Box>
				</AccordionSummary>
				<AccordionDetails className={classes.details} onClick={handleClick}>
					<div style={{ width: "100%", overflowX: "auto" }}>
						<DataGrid
							loading={loading}
							rows={testCasesListData || []}
							columns={tableColumns}
							autoHeight
							disableColumnMenu
							getRowClassName={getRowClassName}
							getRowId={(row) => row.test_case_id}
							style={{ minWidth: "600px" }}
							localeText={{
								noRowsLabel: noRowsLabel,
							}}
							rowHeight={38}
							{...(testCasesListData.length < 5 && {
								hideFooterPagination: true,
								hideFooter: true,
							})}
							initialState={{
								pagination: { paginationModel: { pageSize: 5 } },
							}}
							pageSizeOptions={[5, 10, 25]}
							selectionModel={selectedTestCaseRow}
							onSelectionModelChange={(newSelection) => {
								setSelectedTestCaseRow(newSelection.selectionModel);
							}}
							sx={{
								".MuiSelect-icon": {
									color: "white",
								},
								"& .MuiDataGrid-columnHeaders": { backgroundColor: "#d8d8d8" },
							}}
						/>
					</div>
				</AccordionDetails>
			</Accordion>
		))}

		<ViewMultiStepsModal 
			open={openViewMultiStepsModal}
			setClose={() => setOpenViewMultiStepsModal(false)}
			multiStepData={selectedMultiStepData}
		/>
    </>
};

const CreateJaasIssueModal = ({ open, setClose, testCases, currentTestCycleForJaasIssue }) => {
	  
  const dispatch = useDispatch();

  const initialRows = (testCases.length > 0 ? testCases : []).map((tc, idx) => ({
    test_case_id: tc.test_case_id,
	test_case_result_id: tc.test_case_result_id,
    test_case_name: tc.test_case_name,
    description: tc.description || "",
  }));

  const [projects, setProjects] = useState([]);
  const [JaasIssueTypes, setJaasIssueTypes] = useState([]);
  const [selectedJaasIssueType, setSelectedJaasIssueType] = useState("Bug");
  const [selectedProject, setSelectedProject] = useState("");
  const [rows, setRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({ test_case_name: "", description: "" });
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [errors, setErrors] = useState({});

  const [getJaasProjects] = useGetJaasProjectsMutation();
  const [createJaasIssue] = useCreateJaasIssueMutation();

  useEffect(() => {	
    setRows(initialRows);
    setSelectedRows([]);
    setEditRowId(null);
    setEditValues({ test_case_name: "", description: "" });
    setErrors({});
    setSelectedProject("");
    setAssigneeEmail("");
	setSelectedJaasIssueType("");
  }, [open, testCases]);

  useEffect(() => {
	if (open) {
		fetchJaasProjects();
	}
  }, [open]);

  const fetchJaasProjects = async () => {
	try {
		dispatch(showLoading());
		const { data: response, error } = await getJaasProjects({
			user_id: sessionStorage.getItem("username"),
			function_name: "get-jaas-projects",
		});
		if (response && response.statusCode === 200) {
			setJaasIssueTypes(response.body.issue_types || []);			
			setProjects(response.body.project_details || []);
			dispatch(closeLoading());
		}	
		if (error) throw error;
	} catch (error) {
		console.error("Error fetching JAAS projects:", error);
		dispatch(closeLoading());
	}
};

  const handleEditClick = (row) => {	
    setEditRowId(row.test_case_id);
    setEditValues({
      test_case_name: row.test_case_name,
      description: row.description,
    });
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = (id) => {
    let newErrors = {};
    if (!editValues.test_case_name) newErrors.test_case_name = "Test Case Name required";
    if (!editValues.description) newErrors.description = "Description required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setRows((prevRows) =>
      prevRows.map((row) =>
        row.test_case_id === id
          ? { ...row, test_case_name: editValues.test_case_name, description: editValues.description }
          : row
      )
    );
    setEditRowId(null);
    setEditValues({ test_case_name: "", description: "" });
    setErrors({});
  };

  const handleCloseJaasModal = () => {
    setClose()
  };

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCreateJaasIssue = async () => {	
    let validationErrors = {};
    if (!selectedProject) validationErrors.project = "Project is required";
    if (selectedRows.length === 0) validationErrors.rows = "Select at least one test case";
    if (!assigneeEmail) {
      validationErrors.assigneeEmail = "Assignee Email is required";
    } else if (!validateEmail(assigneeEmail)) {
      validationErrors.assigneeEmail = "Enter a valid email address";
    }
	const selectedData = rows.filter((row) => selectedRows.includes(row.test_case_result_id));
	
	const card_details = [];
	selectedData.forEach((row) => {
		if (!row.test_case_name) {
			validationErrors.test_case_name = "Test Case Name required for all selected rows";
		}
		if (!row.description) {
			validationErrors.description = "Description required for all selected rows";
		}
		card_details.push({
			test_case_result_id: row.test_case_result_id,
			summary: row.test_case_name,
			description: row.description,
		});
	});
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // const selectedData = rows.filter((row) => selectedRows.includes(row.test_case_id));
    dispatch(showLoading());
	const { data, error } = await createJaasIssue({
	  function_name: "create-jaas-ticket",
	  user_id: sessionStorage.getItem("username"),
	  key_name: selectedProject,
	  project_name: projects.find(proj => proj.key === selectedProject)?.name || "",
	  issuetype: selectedJaasIssueType,
	  assignee_email: assigneeEmail,
	  test_cycle_result_id: currentTestCycleForJaasIssue?.test_cycle_result_id, 
	  card_details
	});
	
	if (data && data.statusCode === 200) {
	  dispatch(closeLoading());

	  // Build message for created issues
	  const created = data.body?.created_issues || [];
	  const failed = data.body?.failed_indices || [];

	  let message = "";
	  if (created.length > 0) {
		message += `Created: ${created.map(issue => issue.key).join(", ")}. `;
	  }
	  if (failed.length > 0) {
		message += `Failed indices: ${failed.join(", ")}.`;
	  }
	  if (!message) {
		message = data.message || "Jira cards processed with DB updates";
	  }

	  dispatch(
		showSnackbar({
		  message,
		  className: created.length > 0 && failed.length === 0
			? "color-success-background width-50"
			: "color-warning-background width-50",
		})
	  );

	  setRows(initialRows);
	  setSelectedRows([]);
	  setEditRowId(null);
	  setEditValues({ test_case_name: "", description: "" });
	  setErrors({});
	  setSelectedProject("");
	  setAssigneeEmail("");
	  setSelectedJaasIssueType("Bug");
	  handleCloseJaasModal();

	} else if (error) {
	  dispatch(closeLoading());
	  dispatch(
		showSnackbar({
		  message: error.data?.message || "Failed to create JAAS issue",
		  className: "color-error-background width-50",
		})
	  );
	}
  };

  const columns = [
    { field: "test_case_id", headerName: "Test Case ID", flex: 1 },
    {
      field: "test_case_name",
      headerName: "Test Case Name",
      flex: 1.5,
      renderCell: (params) =>
        editRowId === params.row.test_case_id ? (
          <TextField
            value={editValues.test_case_name}
            onChange={(e) => handleEditChange("test_case_name", e.target.value)}
			onKeyDown={(event) => {
				if (event.key === " ") {
					event.stopPropagation();
				}
			}}
            error={!!errors.test_case_name}
            helperText={errors.test_case_name}
            size="small"
            fullWidth
          />
        ) : (
          params.value
        ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) =>
        editRowId === params.row.test_case_id ? (
          <TextField
            value={editValues.description}
            onChange={(e) => handleEditChange("description", e.target.value)}
			onKeyDown={(event) => {
				if (event.key === " ") {
					event.stopPropagation();
				}
			}}
            error={!!errors.description}
            helperText={errors.description}
            size="small"
            fullWidth
          />
        ) : (
          params.value
        ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.7,
      sortable: false,
      renderCell: (params) =>
        editRowId === params.row.test_case_id ? (
          <>
            <IconButton color="primary" onClick={() => handleSaveEdit(params.row.test_case_id)}>
              <SaveIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => setEditRowId(null)}>
              <CloseIcon />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditClick(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={handleCloseJaasModal}
      aria-labelledby="jaas-issue-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          minWidth: 700,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography id="jaas-issue-modal-title" variant="h6" mb={2}>
          Create Jaas Issue
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl fullWidth size="small" error={!!errors.project}>
            <InputLabel id="project-label">Project Name</InputLabel>
            <Select
              labelId="project-label"
              value={selectedProject}
              label="Project Name"
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((proj) => (
                <MenuItem key={proj.key} value={proj.key}>
                  {proj.name}
                </MenuItem>
              ))}
            </Select>
            {errors.project && (
              <Typography color="error" variant="caption">
                {errors.project}
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={selectedJaasIssueType}
			  onChange={(e) => setSelectedJaasIssueType(e.target.value)}
              label="Type"
            //   readOnly
            //   disabled
            >
              {JaasIssueTypes.map((type) => (
				<MenuItem key={type} value={type}>
					{type}
				</MenuItem>
			  ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Assignee Email Address"
            value={assigneeEmail}
            onChange={(e) => setAssigneeEmail(e.target.value)}
            error={!!errors.assigneeEmail}
            helperText={errors.assigneeEmail}
            fullWidth
            size="small"
          />
        </Box>
        <Box sx={{ height: 350, mb: 2 }}>
          <DataGrid
            rows={rows || []}
            columns={columns || []}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(sRows) => {setSelectedRows([...sRows.ids])}}
            // rowSelectionModel={selectedRows}
            pageSizeOptions={[5, 10]}
			getRowId={(row) => row.test_case_result_id}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            sx={{
              mb: 2,
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
            }}
          />
          {["rows", "test_case_name", "description"].map((key) => errors[key] && (
			<Typography key={key} color="error" variant="caption">
				{errors[key]}
			</Typography>
			)
		  )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleCreateJaasIssue}>
            Create Jaas Issue
          </Button>
          <Button variant="outlined" onClick={handleCloseJaasModal}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
	)
};

const ViewJaasIssueModal = ({ open, setClose, testCases }) => {
  const [rows, setRows] = useState([]);
  const [viewJaasStatus] = useViewJaasStatusMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (open && testCases.length > 0) {
		const jaasIds = [];
		setRows(testCases.map(tc => {
			const sourceQuery = JSON.parse(tc.source_query);
			jaasIds.push(sourceQuery?.jaas_key)
			return {
				test_case_id: tc.test_case_id,
				test_case_name: tc.test_case_name,
				jaas_issue_id: sourceQuery?.jaas_key || "",
				// status: tc.status
			}
		}));
      	fetchJaasStatusForTestcases(jaasIds);
    }
    // eslint-disable-next-line
  }, [open, testCases]);

  const fetchJaasStatusForTestcases = async (jaasIds) => {
	dispatch(showLoading())
	const { data, error } = await viewJaasStatus({
	  function_name: "get-jaas-status", 
	  user_id: sessionStorage.getItem("username"),
	  jaas_keys: jaasIds
	});
	
	if (data && data.statusCode === 200) {
		if(data?.body?.length){
			setRows(row => {
				return row.map(r => {
					const jaasIssue = data.body.find(jaas => jaas.key === r.jaas_issue_id);
					if(jaasIssue){
						return {
							...r,
							status: jaasIssue.status || "N/A"
						}
					}
					return {
						...r,
						status: "N/A"
					}
				});
			})
		}	
	} else {
		dispatch(showSnackbar({
			message: error?.data?.message || "Failed to fetch JAAS issue status",
			className: "color-error-background width-50",
		}));
	}
	dispatch(closeLoading());
  } 

  const columns = [
    { field: "test_case_id", headerName: "Test Case ID", flex: 1 },
    { field: "test_case_name", headerName: "Test Case Name", flex: 2 },
    { field: "jaas_issue_id", headerName: "Jaas Issue ID", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  return (
    <Modal
      open={open}
      onClose={setClose}
      aria-labelledby="view-jaas-issue-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          minWidth: 700,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography id="view-jaas-issue-modal-title" variant="h6" mb={2}>
          View Jaas Issues
        </Typography>
        <Box sx={{ height: 350, mb: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.test_case_id}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            sx={{
              mb: 2,
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={setClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const ViewMultiStepsModal = ({ open, setClose, multiStepData }) => {
  const dispatch = useDispatch();
  const [openViewMultiStepLogsModal, setOpenViewMultiStepLogsModal] = useState(false);
  const [selectedMultiStepLogsData, setSelectedMultiStepLogsData] = useState(null);

  const columns = [
    {
      field: "app_name",
      headerName: "Application",
      flex: 1,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: "500" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "execution_message",
      headerName: "Execution Message",
      flex: 2,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <Tooltip title={params.value} arrow placement="top">
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <CustomStatus status={params.row.status} color={getStatusColor(params.row.status)} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        params.row.app_name === "PANTOMATH" ? (
          <Tooltip title="View Logs">
            <Button
              variant="contained"
              size="small"
              onClick={() => handleViewMultiStepLogs(params.row)}
              sx={{
                textTransform: "none",
                fontWeight: "500",
				marginTop: "-25px",
                backgroundColor: "#2196F3",
                "&:hover": {
                  backgroundColor: "#1976D2",
                },
              }}
            >
              View Logs
            </Button>
          </Tooltip>
        ) : null
      ),
    },
  ];

  const handleViewMultiStepLogs = (row) => {
    dispatch(showLoading());
    
    const payload = {
      user_id: sessionStorage.getItem("username"),
      function_name: "get-multistep-logs",
      batch_execution_id: row.batch_execution_id,
      job_execution_id: row.job_execution_id,
      job_name: row.job_name,
      batch_id: row.batch_id,
      batch_name: row.batch_name,
    };

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
          redirectToLogin();
          return;
        }
        return response.json();
      })
      .then((response) => {
        dispatch(closeLoading());
        if (response && response.statusCode === 200) {
          const logsData = response.body || response.data;
          setSelectedMultiStepLogsData(logsData);
          setOpenViewMultiStepLogsModal(true);
        } else {
          dispatch(
            showSnackbar({
              message: response?.message || "Failed to fetch multi-step logs",
              className: "color-error-background width-50",
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching multi-step logs:", error);
        dispatch(closeLoading());
        dispatch(
          showSnackbar({
            message: "Error fetching multi-step logs",
            className: "color-error-background width-50",
          })
        );
      });
  };

  return (
    <>
      <Modal
        open={open}
        onClose={setClose}
        aria-labelledby="view-multi-steps-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            minWidth: 800,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography id="view-multi-steps-modal-title" variant="h6" sx={{ fontWeight: "600" }}>
              Multi-Step Execution Results
            </Typography>
            <IconButton
              onClick={setClose}
              sx={{
                padding: 0,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {multiStepData.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No multi-step results found for this test case.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: 400, mb: 2 }}>
              <DataGrid
                rows={multiStepData || []}
                columns={columns}
                getRowId={(row) => row.multi_step_result_id}
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
                initialState={{
                  pagination: { paginationModel: { pageSize: 5, page: 0 } },
                }}
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#e3f2fd",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  },
                  "& .MuiDataGrid-row": {
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  },
                  "& .MuiDataGrid-cell": {
                    paddingY: 1.5,
                    borderBottom: "1px solid #e0e0e0",
                  },
                  "& .MuiTablePagination-root": {
                    borderTop: "1px solid #e0e0e0",
                  },
                }}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}>
            <Button
              variant="outlined"
              onClick={setClose}
              sx={{
                textTransform: "none",
                fontWeight: "500",
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <ViewMultiStepLogsModal
        open={openViewMultiStepLogsModal}
        setClose={() => setOpenViewMultiStepLogsModal(false)}
        logsData={selectedMultiStepLogsData}
      />
    </>
  );
};

const ViewMultiStepLogsModal = ({ open, setClose, logsData }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <Modal
      open={open}
      onClose={setClose}
      aria-labelledby="view-multi-step-logs-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          minWidth: 900,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography id="view-multi-step-logs-modal-title" variant="h6" sx={{ fontWeight: "600" }}>
            Multi-Step Execution Logs
          </Typography>
          <IconButton
            onClick={setClose}
            sx={{
              padding: 0,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {!logsData || (Array.isArray(logsData) && logsData.length === 0) ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No logs available
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 500,
              overflowY: "auto",
              backgroundColor: "#f5f5f5",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 2,
            }}
          >
            {Array.isArray(logsData) ? (
              logsData.map((log, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    pb: 2,
                    borderBottom: index < logsData.length - 1 ? "1px solid #e0e0e0" : "none",
                    "&:last-child": {
                      borderBottom: "none",
                      mb: 0,
                      pb: 0,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "600",
                        color: "#1976D2",
                        minWidth: "180px",
                        flex: "0 0 auto",
                      }}
                    >
                      {formatTimestamp(log.timestamp)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        color: "#333",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        flex: 1,
                      }}
                    >
                      {log.message}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#333", whiteSpace: "pre-wrap" }}>
                {typeof logsData === "string" ? logsData : JSON.stringify(logsData, null, 2)}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 3 }}>
          <Button
            variant="outlined"
            onClick={setClose}
            sx={{
              textTransform: "none",
              fontWeight: "500",
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
