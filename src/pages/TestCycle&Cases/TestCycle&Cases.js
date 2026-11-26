import React, { useEffect, useState } from "react";
import {
	TextField,
	Button,
	Typography,
	IconButton,
	Paper,
	Grid,
	InputAdornment,
	ClickAwayListener,
	MenuItem,
	MenuList,
	Popper,
	Grow,
	Card,
	Chip,
	Stack,
	Table,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
	useGetTestSuitMutation,
	useGetTestCaseListMutation,
	useGetTestCycleInfoMutation,
	useUpdateTestCycleMutation,
	useExecuteTestCaseMutation,
	useSchedulerOperationsMutation,
} from "../../store/mdtSlice";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { checkUserAccess } from "../../utils/utility";
import { useLocation, useNavigate } from "react-router-dom";
import MultiselectDialog from "../../components/MultiselectDialog/MultiselectDialog";
import * as classes from "./TestCycle&Cases.module.css";
import { getDataFromStorage } from "../../utils/utility";
import RefreshIcon from "@mui/icons-material/Refresh";
import TimerIcon from '@mui/icons-material/Timer';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EditIcon from '@mui/icons-material/Edit';
import { AddLink, ArrowBack, Link, Search as SearchIcon } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import TestSuiteAccordion from "./TestSuiteAccordion";
import { ExecutionConfirmationModal } from "./ExecutionConfirmationModal";
import SchedulerModal from "./SchedulerModal";
import { Box } from "@mui/system";
import AddDependenciesDialog from "../../components/TestcaseDependency/AddDependenciesDialog";

const TestCycleAndCases = ({ testCycleData }) => {
	const [testCycleInfo, setTestCycleInfo] = useState({ test_suites: [] });
	const [dialogOpen, setDialogOpen] = useState(false);
	const [testSuites, setTestSuites] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDialogSuites, setSelectedDialogSuites] = useState([]);
	const [testCaseList, setTestCaseList] = useState([]);
	const [selectedTestCases, setSelectedTestCases] = useState([]);
	const dispatch = useDispatch();
	const [getTestSuit] = useGetTestSuitMutation();
	const [getTestCaseList] = useGetTestCaseListMutation();
	const [getTestCycleInfo] = useGetTestCycleInfoMutation();
	const location = useLocation();
	const navigate = useNavigate();
	const testCycle = testCycleData ? testCycleData : location.state?.testCycleData;
	const [updateTestCycle] = useUpdateTestCycleMutation();
	const { selectedOrgAppDetails } = useSelector((state) => state.data);
	const accessCheck = checkUserAccess();
	const [selectedTestCasesIds, setSelectedTestCasesIds] = useState([]);
	const [executeTestCase] = useExecuteTestCaseMutation();
	const [schedulerOperation] = useSchedulerOperationsMutation();
	const [show, setShow] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [openExecutionConfirmationModal, setOpenExecutionConfirmationModal] = useState(false);
	const [testCasesToExecute, setTestCasesToExecute] = useState([]);
	const [runAllTestCaseFlag, setRunAllTestCaseFlag] = useState(true);
	const [isDynamicSelection, setIsDynamicSelection] = useState(false);
	const [masterTestSuites, setMasterTestSuites] = useState([]);
	const [showSchedulerModal, setShowSchedulerModal] = useState(false);
	const [schedule, setSchedule] = useState(false);
	const [addDepsOpen, setAddDepsOpen] = useState(false);
	const [selectedTestcasesWithDeps, setSelectedTestcasesWithDeps] = useState([]);
	const [runWithoutDependecies, setRunWithoutDependecies] = useState(false);

	const fetchTestCycleInfo = async () => {
		try {
			dispatch(showLoading());
			const { data: response, error } = await getTestCycleInfo({
				user_id: sessionStorage.getItem("username"),
				function_name: "get-test-cycle-info",
				test_cycle_id: testCycle?.test_cycle_id,
			});

			if (response && response.data && response.statusCode === 200) {
				setTestCycleInfo(response.data);
			}
			if (!!error) throw error;
		} catch (error) {
			console.error("Error fetching Test cases info:", error);
		} finally {
			setIsLoading(false);
			dispatch(closeLoading());
		}
	};

	useEffect(() => {
		if (!testCycle) return;
		fetchTestCycleInfo();
	}, [testCycle]);

	const fetchAllSuitesAndCases = async () => {
		try {
			const { data: response, error } = await getTestCaseList({ // Using exisiting Slice for fetching test suites as lambda grouping is done.
				function_name: "get-suite-cases",
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				user_id: sessionStorage.getItem("username"),
			});
			if (response && response.body && response.statusCode === 200) {

				// const sortedTestSuites = sortDataInDecOrder(response.body.test_suites, "id");
				setMasterTestSuites(response.body.data);
				// setTotalSuitesCount(response.body.overll_test_suite_count);

			}
			if (!!error) throw error;
		} catch (error) {
			console.error("Failed to fetch test suites and cases: ", error);
		}
	};

	const handleDialogOpen = async () => {
		setDialogOpen(true);
	};

	useEffect(() => {
		if (testCycleInfo.test_suites.length > 0) {
			const preSelectedTestCases = testCycleInfo.test_suites.flatMap((suite) =>
				suite.test_cases.map((testCase) => ({ test_case_id: testCase.test_case_id, depends_on: testCase.depends_on }))
			);
			setSelectedTestCases(preSelectedTestCases);
		}
	}, [testCycleInfo]);

	useEffect(() => {
		if (dialogOpen) {
			fetchAllSuitesAndCases();
		}
		// fetchTestSuites();
		// fetchTestCasesListData();

		//   const preSelectedTestCases = testCaseList
		//     .filter((testCase) => preSelectedTestCasesIds.includes(testCase.test_case_id))
		//     .map((testCase) => testCase.test_case_id);

		//   setSelectedTestCases(preSelectedTestCases);
		// }
	}, [dialogOpen]);

	useEffect(() => {
		if (selectedTestcasesWithDeps.length > 0) {
			handleUpdateTestCycle(selectedTestcasesWithDeps);
			setTimeout(() => {
				setSelectedTestcasesWithDeps([]);
			}, 500);
		}
	}, [selectedTestcasesWithDeps]);

	const handleUpdateTestCycle = async (selectedTestCases) => {
		try {
			dispatch(showLoading());
			const { data: response, error } = await updateTestCycle({
				function_name: "test-cycle-modify",
				test_cycle_id: testCycle?.test_cycle_id,
				test_cases: selectedTestCases,
				user_id: sessionStorage.getItem("username"),
			});

			if (response && response.statusCode === 200) {
				dispatch(
					showSnackbar({
						message: response?.message,
						className: "color-success-background width-50",
					})
				);
				fetchTestCycleInfo();
				setDialogOpen(false);
				dispatch(closeLoading());
			}

			if (response && response.statusCode !== 200) {
				dispatch(
					showSnackbar({
						message: response?.message || "Failed to update test cycle",
						className: "color-error-background width-50",
					})
				);
				dispatch(closeLoading());
			}
			if (error) throw error;
		} catch (error) {
			console.error("Error updating test cycle", error);
			setDialogOpen(false);
		}
	};

	const handleExecuteTestCase = async (dynamicSelectionFlag) => {
		try {
			if (accessCheck) {
				const selectedTestCase = selectedTestCasesIds.map((testCase) => ({
					test_case_id: testCase.test_case_id,
					test_case_name: testCase.test_case_name,
					test_case_type: testCase.test_case_type,
					// isIris: testCase.source_connection === "Iris",
					testType: testCase.testType,
					execution_engine: testCase.execution_engine,
					test_suite_name: testCase.test_suite_name,
					test_suite_id: testCase.test_suite_id,
					source_connection: testCase.source_connection,
					source_db: testCase.source_db,
					source_sql: testCase.source_sql,
					target_connection: testCase.test_case_type === "Data_Testing" ? testCase.target_connection : undefined,
					target_db: testCase.test_case_type === "Data_Testing" ? testCase.target_db : undefined,
					depends_on: testCase.depends_on,
				}));
				setIsDynamicSelection(dynamicSelectionFlag);
				let selectedTestcaseUpdatedCopy = selectedTestCase;

				//Setting all Test cases for running
				if (selectedTestCase.length === 0) {
					setRunAllTestCaseFlag(true)
					selectedTestcaseUpdatedCopy = testCycleInfo.test_suites.flatMap((suite) =>
						suite.test_cases.map((testCase) => ({
							test_case_id: testCase.test_case_id,
							test_case_name: testCase.test_case_name,
							test_case_type: testCase.test_case_type,
							// isIris: testCase.source_connection === "Iris",
							testType: testCase.testType,
							execution_engine: testCase.execution_engine,
							test_suite_name: suite.name,
							test_suite_id: suite.id,
							source_connection: testCase.source_connection,
							source_db: testCase.source_db,
							source_sql: testCase.source_sql,
							target_connection: testCase.test_case_type === "Data_Testing" ? testCase.target_connection : undefined,
							target_db: testCase.test_case_type === "Data_Testing" ? testCase.target_db : undefined,
							depends_on: testCase.depends_on,
						}))
					);
					setTestCasesToExecute(selectedTestcaseUpdatedCopy);
					setOpenExecutionConfirmationModal(true);
				} else { // Setting selected test cases for running
					setRunAllTestCaseFlag(false);
					setOpenExecutionConfirmationModal(true);
					setTestCasesToExecute(selectedTestCase);
				}

			} else {
				showReadOnlySnackbar(dispatch);
			}
		} catch (error) {
			console.error("Error executing test cases:", error);
		}
	};

	const handleCloseSnackbar = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}

		setShow(false);
	};

	const executeTestCases = async (testCases) => {
		try {
			dispatch(showLoading());
			let payload = {
				function_name: schedule ? "scheduler" : "execute",
				service: "test_case_execution",
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env: "dev",
				test_cycle_id: testCycle?.test_cycle_id,
				test_cycle_name: testCycle?.test_cycle_name,
				test_cases: testCases,
				user_id: sessionStorage.getItem("username"),
				// token: getDataFromStorage("token"),
			};

			if (runWithoutDependecies) {
				payload = {
					...payload,
					run_without_dependencies: true,
				}
			}

			let data, error;

			if (schedule) {
				if (schedule.scheduleType === "one-time") {
					payload = {
						...payload,
						schedule_details: {
							action: "CREATE",
							schedule_name: schedule.scheduleName,
							enabled: schedule.isEnabled,
							schedule_type: "ONE_TIME",
							date_time: schedule.startDateAndTime,
						}
					}
				} else if (schedule.scheduleType === "day") {
					payload = {
						...payload,
						schedule_details: {
							action: "CREATE",
							schedule_name: schedule.scheduleName,
							enabled: schedule.isEnabled,
							schedule_type: "RECURRING",
							end_date: schedule.endDate,
							start_date: schedule.startDateAndTime,
							frequency: "every_x_days",
							hour: new Date(schedule.startDateAndTime).getHours(),
							minute: new Date(schedule.startDateAndTime).getMinutes(),
							interval: schedule.recur ? schedule.recurrenceValue : 1,
						},
					}
				} else if (schedule.scheduleType === "week") {
					payload = {
						...payload,
						schedule_details: {
							action: "CREATE",
							schedule_name: schedule.scheduleName,
							enabled: schedule.isEnabled,
							schedule_type: "RECURRING",
							end_date: schedule.endDate,
							start_date: schedule.startDateAndTime,
							frequency: "weekly",
							hour: new Date(schedule.startDateAndTime).getHours(),
							minute: new Date(schedule.startDateAndTime).getMinutes(),
							days_of_week: schedule.selectedDays,
						},
					}
				} else if (schedule.scheduleType === "month") {
					payload = {
						...payload,
						schedule_details: {
							action: "CREATE",
							schedule_name: schedule.scheduleName,
							enabled: schedule.isEnabled,
							schedule_type: "RECURRING",
							end_date: schedule.endDate,
							start_date: schedule.startDateAndTime,
							frequency: "monthly",
							hour: new Date(schedule.startDateAndTime).getHours(),
							minute: new Date(schedule.startDateAndTime).getMinutes(),
							day_of_month: schedule.recurrenceValue
						},
					}
				}

				let { data: d, error: e } = await schedulerOperation(payload);
				data = d;
				error = e;
			} else {
				let { data: d, error: e } = await executeTestCase(payload);
				data = d;
				error = e;
			}

			if (data && data.statusCode === 200) {
				dispatch(
					showSnackbar({
						message: data.message ? data.message : data.body,
						className: "color-success-background width-50",
					})
				);
				fetchTestCycleInfo();
				dispatch(closeLoading());
				handleCloseExecutionConfirmationModal();
				setSchedule(false);
				setShowSchedulerModal(false);
				setTestCasesToExecute([]);
				setTimeout(() => {
					setShow(true);
				}, 5000);
			} else {
				const errorMessage = data?.error || data.body?.error || "Failed to execute test cases";
				dispatch(

					showSnackbar({
						message: errorMessage,
						className: "color-error-background width-50",
					})
				);
				dispatch(closeLoading());
				console.error("Error executing test cases:", error);
				handleCloseExecutionConfirmationModal();
			}

		} catch (error) {
			console.error("Error executing test cases:", error);
		}
	};

	const handleCloseExecutionConfirmationModal = () => {
		setOpenExecutionConfirmationModal(false)
	}

	const handlePathChange = (path) => {
		navigate(`/${path}`);
	};

	const action = (
		<React.Fragment>
			<Button variant="contained" color="primary" size="small" onClick={() => handlePathChange("execution-history")}>
				View
			</Button>
			<IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
				<CloseIcon fontSize="small" />
			</IconButton>
		</React.Fragment>
	);

	const statusColors = {
		Running: "#3fb802",
		Fail: "red",
		"Not Executed": "#2980B9",
		Success: "#3fb802",
	};

	const CustomStatus = ({ status }) => (
		<span style={{ backgroundColor: statusColors[status] }} className={classes.status}>
			{status}
		</span>
	);

	const refreshPage = () => {
		fetchTestCycleInfo();
	};

	return (
		<>
			<ExecutionConfirmationModal
				isDynamicSelection={isDynamicSelection}
				runAllTestCaseFlag={runAllTestCaseFlag}
				openExecutionConfirmationModal={openExecutionConfirmationModal}
				handleCloseExecutionConfirmationModal={handleCloseExecutionConfirmationModal}
				testCasesToExecute={testCasesToExecute}
				setRunWithoutDependecies={setRunWithoutDependecies}
				executeTestCases={executeTestCases} />

			<SchedulerModal
				testCycleName={testCycle?.test_cycle_name}
				onSubmit={(data) => { handleExecuteTestCase(false); setSchedule(data); }}
				open={showSchedulerModal}
				setOpen={setShowSchedulerModal}
			/>

			<Paper
				elevation={0}
				style={{
					margin: "20px 15px 0 15px",
					overflowY: "auto",
					marginBottom: "80px",
				}}
			>

				<Box
					display="flex"
					justifyContent="space-between"
					marginTop={"10px"}
					marginBottom={"10px"}
					alignItems={"end"}
					gap={2}
				>
					{/* Cycle detail section */}
					<Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>

						<Table size="small" sx={{ width: "100%" }}>
							<tbody>
								<tr>
									<td>
										<IconButton onClick={() => navigate("/releases-testcycle")} sx={{ mr: 1 }}><ArrowBack /></IconButton>
									</td>
									<td>
										<Typography variant="h6" color="text.secondary">
											Test Cycle Name:
										</Typography>
									</td>
									<td style={{ fontWeight: "bold" }}>
										<b>{testCycle?.test_cycle_name ?? ""}</b>
									</td>
								</tr>

							</tbody>
						</Table>

					</Box>

					<div style={{ display: "flex", gap: "10px", flexDirection: "column", justifyContent: "flex-end" }}>
						{/* Search Dappa */}
						{/* <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            /> */}

						{/* Page Level Action Buttons */}
						<Grid item xs={12} sm={6} md={8} container justifyContent="flex-end" spacing={1}>
							<Chip
								label={testCycleInfo.test_cycle_status}
								sx={{
									fontWeight: 600,
									color: "#fff",
									marginLeft: "5px",
									minWidth: "100px",
									backgroundColor:
										testCycleInfo.test_cycle_status === "Running"
											? "#3fb802"
											: testCycleInfo.test_cycle_status === "Success"
												? "#1976d2"
												: testCycleInfo.test_cycle_status === "Fail"
													? "#d32f2f"
													: "#757575",
									textTransform: "capitalize",
								}}
								size="medium"
							/>
							<Grid item>
								<Button
									variant="contained"
									className={classes.btn}
									size="small"
									endIcon={<EditIcon />}
									onClick={handleDialogOpen}
								>
									Update Cycle
								</Button>
							</Grid>
							<Grid item>
								<Button
									variant="contained"
									className={classes.btn}
									size="small"
									endIcon={<AddLink />}
									onClick={() => { setAddDepsOpen(true); }}
								>
									Dependencies
								</Button>
							</Grid>
							<Grid item>
								<RunButton
									handleExecuteTestCase={handleExecuteTestCase}
									setRunWithoutDependecies={setRunWithoutDependecies}
									testCycleInfo={testCycleInfo} />
							</Grid>
							<Grid item>
								<Button variant="contained"
									className={classes.btn}
									size="small"
									endIcon={<TimerIcon />}
									onClick={() => { setShowSchedulerModal(true) }} >Schedule</Button>
							</Grid>
							<Grid item>
								<IconButton
									color="primary"
									onClick={refreshPage}
									sx={{ border: "1px solid #ccc", marginTop: "-5px" }}
									aria-label="refresh"
								>
									<RefreshIcon />
								</IconButton>
							</Grid>
						</Grid>
					</div>
				</Box>

				{isLoading ? (
					<Typography align="center" marginTop={"100px"}>
						Loading...
					</Typography>
				) : testCycleInfo.test_suites.length > 0 ? (
					<TestSuiteAccordion
						data={testCycleInfo}
						searchQuery={searchQuery}
						selectedTestCasesIds={selectedTestCasesIds}
						setSelectedTestCasesIds={setSelectedTestCasesIds}
					/>
				) : (
					<Typography align="center" marginTop={"100px"}>
						No Test Case available for given Test Cycle.
					</Typography>
				)}
			</Paper>
			<MultiselectDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				type="testcycle"
				options={masterTestSuites}
				// testCases={testCaseList}
				updateSelectedIds={handleUpdateTestCycle}
				selectedIds={selectedTestCases}
			// testCycleInfo={testCycleInfo}
			/>
			<AddDependenciesDialog
				open={addDepsOpen}
				setOpen={setAddDepsOpen}
				selectedTestCases={testCycleInfo.test_suites.flatMap(suite => suite.test_cases.map(tc => ({ test_case_id: tc.test_case_id, test_case_name: tc.test_case_name, depends_on: tc.depends_on })))}
				testCases={testCycleInfo.test_suites.flatMap(suite =>
					suite.test_cases.map(tc => ({ test_case_id: tc.test_case_id, test_case_name: tc.test_case_name, depends_on: tc.depends_on }))
				)}
				setSeletedTestcasesWithDeps={setSelectedTestcasesWithDeps}
			/>
			<Snackbar
				open={show}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				message="Navigate to Execution History to see test case status"
				action={action}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				sx={{ marginTop: "100px" }}
			/>
		</>
	);
};

export default TestCycleAndCases;


const RunButton = ({ testCycleInfo, handleExecuteTestCase, setRunWithoutDependecies }) => {
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return;
		}

		setOpen(false);
	};

	function handleListKeyDown(event) {
		if (event.key === 'Tab') {
			event.preventDefault();
			setOpen(false);
		} else if (event.key === 'Escape') {
			setOpen(false);
		}
	}

	// return focus to the button when we transitioned from !open -> open
	const prevOpen = React.useRef(open);

	useEffect(() => {
		if (prevOpen.current === true && open === false) {
			anchorRef.current.focus();
		}

		prevOpen.current = open;
	}, [open]);

	return <div>
		<Button
			ref={anchorRef}
			aria-controls={open ? 'composition-menu' : undefined}
			aria-expanded={open ? 'true' : undefined}
			aria-haspopup="true"
			variant="contained"
			endIcon={<DirectionsRunIcon />}
			// className={classes.btn}
			size="small"
			disabled={testCycleInfo.test_suites.length === 0 || testCycleInfo.test_cycle_status === "Running"}
			sx={{
				backgroundColor: (testCycleInfo.test_suites.length == 0 || testCycleInfo.test_cycle_status === "Running") ? "#cccccc !important" : "#0ea5e9 !important",
				color: "#fff !important",
			}}
			onClick={handleToggle}
		>
			Run
		</Button>
		<Popper
			sx={{ zIndex: 2 }}
			open={open}
			anchorEl={anchorRef.current}
			role={undefined}
			placement="bottom-start"
			transition
			disablePortal
		>
			{({ TransitionProps, placement }) => (
				<Grow
					{...TransitionProps}
					style={{
						transformOrigin:
							placement === 'bottom-start' ? 'left top' : 'left bottom',
					}}
				>
					<Paper>
						<ClickAwayListener onClickAway={handleClose}>
							<MenuList
								autoFocusItem={open}
								id="composition-menu"
								aria-labelledby="composition-button"
								onKeyDown={handleListKeyDown}
							>
								<MenuItem onClick={(e) => { handleExecuteTestCase(false); setRunWithoutDependecies(false); handleClose(e); }}>Run</MenuItem>
								<MenuItem onClick={(e) => { handleExecuteTestCase(false); setRunWithoutDependecies(true); handleClose(e); }}>Run without Dependencies</MenuItem>
								<MenuItem onClick={(e) => { handleExecuteTestCase(true); setRunWithoutDependecies(false); handleClose(e); }}>Run with Dynamic Values</MenuItem>
							</MenuList>
						</ClickAwayListener>
					</Paper>
				</Grow>
			)}
		</Popper>
	</div>
}