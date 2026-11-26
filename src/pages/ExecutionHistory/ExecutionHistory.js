import React, { useState, useEffect } from "react";
import { IconButton, Accordion, AccordionSummary, AccordionDetails, Typography, Grid, TablePagination, TextField, InputAdornment, FormControl, MenuItem, InputLabel, Select, Tooltip, Container, Button, Paper, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useGetTestCyclesExecutionListMutation, useGetTestCasesExecutionListMutation, useGetTestCaseReportMutation, useDownloadTestCaseReportMutation, useDownloadTestCycleReportMutation } from "../../store/mdtSlice";
import { useDispatch, useSelector } from "react-redux";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import * as classes from "./ExecutionHistory.module.css";
import TestCaseReportDialog from "../TestCaseReport/TestCaseReportDialog";
import { ContentCopy, Search as SearchIcon, Visibility } from "@mui/icons-material";
import SQLViewDialog from "../../components/SQLViewDialog/SQLViewDialog";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewPastExecutionModel from "../../components/ViewPastExecutionDialog/ViewPastExecutionDialog";
import { RenderTestCycles } from "./RenderTestCycles";


const ExecutionHistory = () => {
  const dispatch = useDispatch();
  const [openTestCaseReportDialog, setOpenTestCaseReportDialog] = useState(false);
  const [testCycleListData, setTestCycleListData] = useState([]);
  const [testCycleListDataPastExecution, setTestCycleListDataPastExecution] = useState([]);
  const [testCasesListData, setTestCasesListData] = useState([]);
  const { selectedOrgAppDetails } = useSelector((state) => state.data);
  const [openedAccordion, setOpenedAccordion] = useState(null);
  const [openedTestCycle, setOpenedTestCycle] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [testCycleCount, setTestCycleCount] = useState(0);
  const [testCyclePastExecutionCount, setTestCyclePastExecutionCount] = useState(0);
  const [s3Url, setS3url] = useState(null);
  const [searchColumn, setSearchColumn] = useState("");
  
  const [openSqlQueryDialog, setOpenSqlQueryDialog] = useState(false);
  const [sqlQueryContent, setSqlQueryContent] = useState("");
  const [title, setTitle] = useState("");
  // const [testCycleData, setTestCycleData] = useState([]);
  const storedDuration = localStorage.getItem("selectedDuration");
  const [duration, setDuration] = useState(storedDuration || "");
  const [selectedTestCaseResultId, setSelectedTestCaseResultId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPastExecutionModal, setShowPastExecutionModal] = useState(false);
  const [selectedTestCycle, setSelectedTestCycle] = useState({});
  const [selectedTestCycleId, setSelectedTestCycleId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [textToCopy, setTextToCopy] = useState("");
  const [filters, setFilters] = useState({});

  const [getTestCyclesExecutionList] = useGetTestCyclesExecutionListMutation();
  // const [getTestCasesExecutionList] = useGetTestCasesExecutionListMutation();
  const [downloadTestCaseReport] = useDownloadTestCaseReportMutation();
  const [downloadTestCycleReport] = useDownloadTestCycleReportMutation();
  const [noRowsLabel, setNoRowsLabel] = useState("No Test Case Execution History found for the given Test Cycle Execution");


  const handleOpenDialog = (content, title) => {
    setSqlQueryContent(content);
    setTitle(title);
    setOpenSqlQueryDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenSqlQueryDialog(false);
  };

  const handleColumnChange = (event) => {
    setSearchColumn(event.target.value);
  };

  const handleSearchValueChange = (event) => {
    setFilters({
      [searchColumn]: event.target.value
    });
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchTestCycleList(filters, pageSize, 0, undefined, false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
    fetchTestCycleList({}, pageSize, 0, undefined, false);
  };

  // const filterTestCycles = (testCycles) => {
  //   return testCycles.filter((testCycle) => {
  //     const searchLowerCase = searchTestCycle ? searchTestCycle.toLowerCase() : "";

  //     return testCycle.test_cycle_id.toString().includes(searchLowerCase) || testCycle.test_cycle_name.toLowerCase().includes(searchLowerCase) || testCycle.time_stamp.toString().includes(searchLowerCase) || testCycle.status.toLowerCase().includes(searchLowerCase);
  //   });
  // };

  const RenderPagination = ({page, pageSize, setPage, setPageSize}) => {
    return (
      <TablePagination
        component="div"
        // count={showPastExecutionModal ? selectedTestCycle.children.length : testCycleListData.length}
        count={showPastExecutionModal ? testCyclePastExecutionCount : testCycleCount}
        page={page - 1}
        onPageChange={(event, newPage) => setPage(newPage + 1)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={(event) => setPageSize(+event.target.value)}
        sx={{
          ".MuiSelect-icon": {
            color: "white",
          },
        }}
      />
    );
  };

  const handleSort = () => {
    const sortedData = [...testCycleListData].sort((a, b) => {
      const dateA = Date.parse(a.time_stamp);
      const dateB = Date.parse(b.time_stamp);

      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    setTestCycleListData(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleAccordionClick = (testCycle, isJaaz = false) => {
    if (openedAccordion === testCycle.test_cycle_result_id) {
      setOpenedAccordion(null);
      setOpenedTestCycle(null);
    } else {
      if(!isJaaz){
        setOpenedAccordion(testCycle.test_cycle_result_id);
      }
      // fetchTestCasesList(testCycle.test_cycle_result_id);
      setOpenedTestCycle(testCycle);
    }
  };

  // const groupTestCycleObject = (data) => {
  //   const groupedData = {};

  //   data.forEach(item => {
  //     const testCycleId = item.test_cycle_id;
  //     if (groupedData[testCycleId]) {
  //       groupedData[testCycleId].push(item);
  //     } else {
  //       groupedData[testCycleId] = [item];
  //     }
  //   });

  //   // Sort values within each group based on time_stamp in reverse order
  //   Object.keys(groupedData).forEach(key => {
  //     groupedData[key].sort((a, b) => {
  //       return new Date(b.time_stamp) - new Date(a.time_stamp);
  //     });
  //   });

  //   // Adding all the object as children to 0th object
  //   Object.keys(groupedData).forEach(key => {
  //     const rootItem = {...groupedData[key][0]};
  //     rootItem.children = groupedData[key].slice(1);
  //     groupedData[key] = rootItem;
  //   });

  //   return Object.values(groupedData);
  // }

  const fetchTestCycleList = async (filters, limit, offset, testCycleIdForPastExecution, isPastExecution) => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getTestCyclesExecutionList({
        user_id: sessionStorage.getItem("username"),
        function_name: "get-executions",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        test_cycle_id: testCycleIdForPastExecution,
        filters: filters || {},
        limit: limit,
        offset: offset,
      });
      if (response && response.data && response.statusCode === 200) {
        const testCycles = response.data.test_cycle_executions;

        // const groupedTestCycles = groupTestCycleObject([...testCycles]); //grouping test cycles based on test ID and moving all the past executions as children
        
        // const sortedTestCycles = [...groupedTestCycles].sort((a, b) => {
        //   const dateA = Date.parse(b.time_stamp);
        //   const dateB = Date.parse(a.time_stamp);
        //   return dateA - dateB;
        // });
        if(isPastExecution){
          setTestCycleListDataPastExecution(testCycles);
          setTestCyclePastExecutionCount(response.data.total_count || 0);
        } else {
          
          setTestCycleListData(testCycles);
          setTestCycleCount(response.data.total_count || 0);
        }
        setLoading(false);
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching test cycle list:", error);
    } finally {
      dispatch(closeLoading());
    }
  };

  useEffect(() => {
    fetchTestCycleList(filters, pageSize, (page - 1) * pageSize, undefined, false);
  }, [selectedOrgAppDetails, getTestCyclesExecutionList, page, pageSize]);

  // const fetchTestCasesList = async (testCycleId) => {
  //   try {
  //     dispatch(showLoading());
  //     const { data: response, error } = await getTestCasesExecutionList({
  //       test_cycle_result_id: testCycleId,
  //       user_id: sessionStorage.getItem("username"),
  //       function_name: "get-test-case-executions",
  //     });
  //     if (response && response.data && response.statusCode === 200) {
  //       const testCases = response.data.test_cases.map((item) => ({
  //         ...item,
  //         id: item.test_case_id,
  //       }));
  //       if(testCases.length > 0){
  //         setTestCasesListData(testCases);
  //       } else {
  //         setNoRowsLabel(response.message);
  //         setTestCasesListData([]);
  //       }
  //       setLoading(false);
  //       dispatch(closeLoading());
  //     }
  //     if (!!error) throw error;
  //   } catch (error) {
  //     console.error("Error fetching test cases execution list:", error);
  //   }
  // };

  const handleFetchTestCaseReport = async (id, event, isView) => {
    event.stopPropagation();
    try {
      dispatch(showLoading());
      const { data: response, error } = await downloadTestCaseReport({
        function_name: "mdt-download-report",
        test_case_result_id: id,
        user_id: sessionStorage.getItem("username"),
        report_action: isView ? "view" : "download"
      });
      if (response && response.statusCode === 200) {
        if (response.body) {
          setS3url(response.body.download_url);
          if (!isView) {
            const link = document.createElement("a");
            link.href = response.body.download_url;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);

            if(response.body.file_password !== null && response.body.file_password !== "None"){
              setOpenSnackbar(true);
              setSnackbarMessage(`Use this password to open the report: ${response.body.file_password}`);
              setTextToCopy(response.body.file_password);             
            }
            
          } else {
            setOpenTestCaseReportDialog(true);
            setSelectedTestCaseResultId(id);
          }
        } else {
          dispatch(
            showSnackbar({
              message: response.body,
              className: "color-error-background width-50",
            })
          );
        }
      } else {
        dispatch(
          showSnackbar({
            message: response.body,
            className: "color-error-background width-50",
          })
        );
      }
      dispatch(closeLoading());
    } catch (error) {
      dispatch(closeLoading());
      console.error("Error downloading test cases Report:", error);
    }
  };

  const handleFetchTestCycleReport = async (event, testCycle) => {
    event.stopPropagation();
    try {
		dispatch(showLoading());
		const { data: response } = await downloadTestCycleReport({
      function_name: "mdt-download-test-cycle-report",
			test_cycle_result_id: testCycle.test_cycle_result_id,
      user_id: sessionStorage.getItem("username"),
      report_action: "download"
		});
		
		if (response && response.statusCode) {
			if (response.body && response.statusCode === 200) {
				setS3url(response.body.download_url);
				
				const link = document.createElement("a");
				link.href = response.body.download_url;
				document.body.appendChild(link);
				link.click();
				URL.revokeObjectURL(link.href);
				document.body.removeChild(link);
        
        if(response.body.file_password !== null && response.body.file_password !== "None"){
          setOpenSnackbar(true);
          setSnackbarMessage(`Use this password to open the report: ${response.body.file_password}`);
          setTextToCopy(response.body.file_password);             
        }
        
			} else {
				dispatch(
					showSnackbar({
						message: response?.body,
						className: "color-error-background width-50",
					})
				);
			}
		} else {
      dispatch(
        showSnackbar({
          message: response.body,
          className: "color-error-background width-50",
        })
      );
    }
		dispatch(closeLoading());
    } catch (error) {
		dispatch(closeLoading());
      	console.error("Error downloading test cycle Report:", error);
    }
  };

  const handleIconClick = (e) => {
    e.stopPropagation();
    handleSort();
  };

  useEffect(() => {
    if (duration && duration !== "None" && parseInt(duration) > 0) {
      const reloadTimer = setTimeout(() => {
        window.location.reload();
      }, duration * 1000);

      return () => clearTimeout(reloadTimer);
    }
  }, [duration]);


  const refreshPage = () => {
    setOpenedAccordion(null);
    fetchTestCycleList({}, pageSize, (page - 1) * pageSize, undefined, false);
  };

  const handleViewPastExecution = (event, selectedTestCycleId) => {
    event.stopPropagation();
    setShowPastExecutionModal(true)
    // setSelectedTestCycle(selectedTestCycleId)
    setSelectedTestCycleId(selectedTestCycleId);
    fetchTestCycleList({}, undefined, undefined, selectedTestCycleId, true);
  }

  const CopyPassword = () => {
    navigator.clipboard.writeText(textToCopy)
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
    setSnackbarMessage("");
    setTextToCopy("")
  }

  const copyPasswordAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={CopyPassword}
      >
       <ContentCopyIcon fontSize="small"/>
      </IconButton>

      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={60000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={copyPasswordAction}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />

      <ViewPastExecutionModel
        open={showPastExecutionModal}
        setOpen={setShowPastExecutionModal}
        // selectedTestCycle={selectedTestCycle}
        selectedTestCycleId={selectedTestCycleId}
        handleClose={() => {
          setShowPastExecutionModal(false);
          setSelectedTestCycle({})
        }}
        sortOrder={sortOrder}
        location={location}
        handleIconClick={handleIconClick}
        // filterTestCycles={filterTestCycles}
        loading={loading}
        handleAccordionClick={handleAccordionClick}
        openedTestCycle={openedTestCycle}
        openedAccordion={openedAccordion}
        testCasesListData={testCasesListData}
        testCycleListData={testCycleListDataPastExecution}
        setTestCycleListDataPastExecution={setTestCycleListDataPastExecution}
        setTestCasesListData={setTestCasesListData}
        handleOpenDialog={handleOpenDialog}
        openSqlQueryDialog={openSqlQueryDialog}
        handleFetchTestCaseReport={handleFetchTestCaseReport}
        handleFetchTestCycleReport={handleFetchTestCycleReport}
        RenderPagination={RenderPagination}
        noRowsLabel={noRowsLabel}
      />
      <Paper
        elevation={0}
        style={{
          margin: "20px 15px 60px 15px",
        }}
      >
        <Grid item xs={12} sm={6} display={"flex"} justifyContent={location.pathname !== "/home" ? "space-between" : "flex-end"} alignItems={"center"} marginBottom={"20px"} gap={2}>
          <Box display={"flex"} gap={1} alignItems={"center"}>
            {location.pathname !== "/home" && (
              <>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Select Column</InputLabel>
                  <Select
                    value={searchColumn}
                    onChange={handleColumnChange}
                    label="Select Column"
                  >
                    <MenuItem value="test_cycle_id">Test Cycle ID</MenuItem>
                    <MenuItem value="test_cycle_name">Test Cycle Name</MenuItem>
                    <MenuItem value="test_case_id">Test Case ID</MenuItem>
                    <MenuItem value="test_case_name">Test Case Name</MenuItem>
                    <MenuItem value="user_id">User Email</MenuItem>
                    <MenuItem value="execution_engine">Execution Engine</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={filters[searchColumn]}
                  onChange={handleSearchValueChange}
                  disabled={!searchColumn}
                />

                <Button 
                  variant="contained" 
                  // size="small" 
                  onClick={handleApplyFilters}
                  disabled={!searchColumn || !filters[searchColumn]}
                >
                  Search
                </Button>

                <Button 
                  variant="outlined" 
                  // size="small" 
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </>
            )}
          </Box>
          <Button variant="contained" className={classes.btn} size="small" onClick={refreshPage}>
            <RefreshIcon />
          </Button>
        </Grid>
        {/* <Accordion defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
            style={{
              background: "#323232",
              justifyContent: "space-between",
              color: "white",
              height: "47px",
              minHeight: 0,
            }}
          >
            <Typography>Execution History</Typography>
          </AccordionSummary>
          <AccordionDetails> */}
            <div>
              <ExecutionHistoryTableHeader 
                sortOrder={sortOrder}
                location={location}
                handleIconClick={handleIconClick}
                showViewPastOption={true}/>

              <RenderTestCycles 
                // filterTestCycles={filterTestCycles}
                setTestCasesListData={setTestCasesListData}
                page={page}
                pageSize={pageSize}
                loading={loading}
                handleAccordionClick={handleAccordionClick}
                openedTestCycle={openedTestCycle}
                openedAccordion={openedAccordion}
                testCycleListData={testCycleListData}
                testCasesListData={testCasesListData}
                // setTestCycleListData={setTestCycleListData}
                handleOpenDialog={handleOpenDialog}
                openSqlQueryDialog={openSqlQueryDialog}
                handleViewPastExecution={handleViewPastExecution}
                handleFetchTestCaseReport={handleFetchTestCaseReport}
                handleFetchTestCycleReport={handleFetchTestCycleReport}
                noRowsLabel={noRowsLabel}
                showViewPastOption={true}/>
            </div>
          {/* </AccordionDetails> */}
          {location.pathname !== "/home" && <RenderPagination page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize}/>}
        {/* </Accordion> */}
      </Paper>
      
      <TestCaseReportDialog 
        open={openTestCaseReportDialog} 
        setOpen={setOpenTestCaseReportDialog} 
        s3Url={s3Url} 
        testCaseResultId={selectedTestCaseResultId} 
        handleFetchTestCaseReport={handleFetchTestCaseReport} />

      <SQLViewDialog 
        open={openSqlQueryDialog} 
        handleClose={handleCloseDialog} 
        queryContent={sqlQueryContent} 
        title={title} 
        showCopy={true} />
    </div>
  );
};

export default ExecutionHistory;


export const ExecutionHistoryTableHeader = ({ sortOrder, location, handleIconClick, showViewPastOption }) => {
  const headerStyles = {
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", backgroundColor: "#b2b2b2", padding: "10px 5px", mb: 1}}>
      {showViewPastOption && (
        <>
          <Typography sx={{ width: "8%", ...headerStyles }}>
            Test Cycle ID
          </Typography>
          <Typography sx={{ width: "16%", ...headerStyles }}>
            Test Cycle Name
          </Typography>
        </>
      )}

      <Typography sx={{ width: "16%", ...headerStyles }}>
        Timestamp
        {location.pathname !== "/home" && (
          <>
            {sortOrder === "asc" ? (
              <ArrowDownwardIcon onClick={handleIconClick} cursor="pointer" />
            ) : (
              <ArrowUpwardIcon onClick={handleIconClick} cursor="pointer" />
            )}
          </>
        )}
      </Typography>
      <Typography sx={{ width: "16%", ...headerStyles }}>
        UserName
      </Typography>
      <Typography sx={{ width: "8%", ...headerStyles }}>
        Duration
      </Typography>
      <Typography sx={{ width: "8%", ...headerStyles }}>
        Pass %
      </Typography>
      <Typography sx={{ width: "8%", ...headerStyles }}>
        Actions
      </Typography>
      <Typography sx={{ width: "16%", ...headerStyles }}>
        Status
      </Typography>
    </Box>
  );
};