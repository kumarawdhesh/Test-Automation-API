import { DataGrid } from "@mui/x-data-grid";
import ReplayIcon from "@mui/icons-material/Replay";
import LinkIcon from "@mui/icons-material/Link";
import { Box, Button, IconButton, Tooltip, Typography, Modal, Snackbar, TextField } from "@mui/material";
import { CustomStatus, getStatusColor } from "../ExecutionHistory/RenderTestCycles";
import { Article, Close, ContentCopy, Replay, Visibility } from "@mui/icons-material";
import { useDownloadTestCycleReportMutation, useGetTestCasesExecutionListMutation } from "../../store/mdtSlice";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import TestCycleReportDialog from "./TestCycleReportDialog";

function ExecutionHistory({executionHistory: initialExecutionHistory, selectedDomain, fetchTCsAndExecutionHistory}) {

    const [getTestCasesExecutionList] = useGetTestCasesExecutionListMutation();
    const [downloadTestCycleReport] = useDownloadTestCycleReportMutation();
    const [filteredExecutions, setFilteredExecutions] = useState([]);
    const [executionHistory, setExecutionHistory] = useState([]);
    const dispatch = useDispatch();

    const [textToCopy, setTextToCopy] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [testCasesListData, setTestCasesListData] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openTestCycleReportDialog, setOpenTestCycleReportDialog] = useState(false);
    const [selectedTestCycleResultId, setSelectedTestCycleResultId] = useState(null);
    const [s3Url, setS3url] = useState("");

    useEffect(() => {
        if (initialExecutionHistory) {
            setExecutionHistory(initialExecutionHistory);
        }
    }, [initialExecutionHistory]);

    const getPassPercentage = (totalTestCases, passedTestCases) => {
      if(totalTestCases !== null && passedTestCases !== null){
        let val = ((passedTestCases/totalTestCases) * 100).toFixed(0);
        if(!isNaN(val)){
          return <Tooltip title={<><p>Total Pass: {passedTestCases}</p><p>Total Fail: {totalTestCases-passedTestCases}</p></>}>{`${val}%`}</Tooltip>
        }
      }
    }

    const fetchTestCasesList = async (testCycleResultId) => {
      try {
        dispatch(showLoading());
        const { data: response, error } = await getTestCasesExecutionList({
          test_cycle_result_id: testCycleResultId,
          user_id: sessionStorage.getItem("username"),
          function_name: "get-test-case-executions",
        });
        if (response && response.data && response.statusCode === 200) {
          const testCases = response.data.test_cases.map((item) => ({
            ...item,
            id: item.test_case_id,
          }));
          setTestCasesListData(testCases);
          setOpenModal(true);
          dispatch(closeLoading());
        } else {
          setTestCasesListData([]);
          setOpenModal(true);
          dispatch(closeLoading());
        }
        if (!!error) throw error;
      } catch (error) {
        setTestCasesListData([]);
        setOpenModal(true);
        console.error("Error fetching test cases execution list:", error);
        dispatch(closeLoading());
      }
    };

    const handleFetchTestCycleReport = async (testCycleResultId) => {
      try {
      dispatch(showLoading());
      const { data: response } = await downloadTestCycleReport({
        function_name: "mdt-download-test-cycle-report",
        test_cycle_result_id: testCycleResultId,
        user_id: sessionStorage.getItem("username"),
        report_action: "download"
      });
      
      if (response && response.statusCode) {
        if (response.body && response.statusCode === 200) {
          setSelectedTestCycleResultId(testCycleResultId);
          setOpenTestCycleReportDialog(true);
          setS3url(response.body.download_url);
          // const link = document.createElement("a");
          // link.href = response.body.download_url;
          // document.body.appendChild(link);
          // link.click();
          // URL.revokeObjectURL(link.href);
          // document.body.removeChild(link);
          
          // if(response.body.file_password !== null && response.body.file_password !== "None"){
          //   setOpenSnackbar(true);
          //   setSnackbarMessage(`Use this password to open the report: ${response.body.file_password}`);
          //   setTextToCopy(response.body.file_password);             
          // }
          
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

    const CopyPassword = () => {
      navigator.clipboard.writeText(textToCopy)
    }
  
    const handleSnackbarClose = () => {
      setOpenSnackbar(false);
      setSnackbarMessage("");
      setTextToCopy("")
    }
  
    const copyPasswordAction = (
      <>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={CopyPassword}
        >
          <ContentCopy fontSize="small"/>
        </IconButton>
  
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleSnackbarClose}
        >
          <Close fontSize="small" />
        </IconButton>
      </>
    );
    
    // Execution History Table Columns
    const executionColumns = [
      { field: "test_cycle_result_id", headerName: "Execution ID", flex: 1 },
      { field: "test_cycle_name", headerName: "Execution Name", flex: 1 },
      {
        field: "passPercent",
        headerName: "Pass %",
        flex: 1,
        renderCell: (params) => {
          return params.row.status !== "Running" ? getPassPercentage(params.row.total_test_case_count, params.row.total_pass_count) : "0%"
        },
      },
      {
        field: "user_id",
        headerName: "Executed By",
        flex: 1,
        renderCell: (params) => {
          return (
            <Tooltip title={params.row.user_id}>
              <span style={{ cursor: "pointer" }}>
                {params.row.user_id.length > 20 ? `${params.row.user_id.substring(0, 20)}...` : params.row.user_id}
              </span>
            </Tooltip>
          );
        }
      },
      {
        field: "time_stamp",
        headerName: "Created At",
        flex: 1,
        renderCell: (params) => {
          const date = new Date(params.row.time_stamp);
          return date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        sortable: false,
        renderCell: (params) => {
          
          return <>
            {/* <Tooltip title="Rerun Tests">
              <IconButton size="small">
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip> */}
            <Tooltip title="View Report">
              <IconButton 
                disabled={params.row.status === "Running"}
                onClick={() => handleFetchTestCycleReport(params.row.test_cycle_result_id)}
                size="small">
                <Article fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton 
                disabled={params.row.status === "Running"}
                onClick={() => {fetchTestCasesList(params.row.test_cycle_result_id)}} 
                size="small">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (param) => {
          return (
            <span
                variant="outlined"
                style={{
                  borderRadius: "20px",
                  border: "0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  width: "100%"
                }}
            >
                <CustomStatus status={param.row.status} color={getStatusColor(param.row.status)} />
            </span>
          );
        },
      }
    ];

    // Modal columns for test case details
    const testCaseColumns = [
      { field: "test_case_id", headerName: "Test Case ID", flex: 1 },
      { field: "test_case_name", headerName: "Test Case Name", flex: 2 },
      { 
        field: "source_query", 
        headerName: "Actual SQL", 
        flex: 2,
        renderCell: (params) => {
          let sourceQueryObj = null;
          let sourceQueryValue = null;
          try {
            if (params.row.source_query) {
              sourceQueryObj = JSON.parse(params.row.source_query);
              sourceQueryValue = sourceQueryObj && sourceQueryObj.source_query !== undefined ? sourceQueryObj.source_query : null;
            }
          } catch (e) {
            sourceQueryValue = null;
          }
          if (!sourceQueryValue) {
            return <span>No Source Query</span>;
          }
          return (
            <Tooltip title={sourceQueryValue}>
              <span style={{ cursor: "pointer" }}>
                {sourceQueryValue.length > 50 ? `${sourceQueryValue.substring(0, 50)}...` : sourceQueryValue}
              </span>
            </Tooltip>
          );
        }
      },
      { 
        field: "target_query", 
        headerName: "Expected SQL", 
        flex: 2,
        renderCell: (params) => (
          <Tooltip title={params.row.target_query}>
            <span style={{ cursor: "pointer" }}>
              {params.row.target_query.length > 50 ? `${params.row.target_query.substring(0, 50)}...` : params.row.target_query}
            </span>
          </Tooltip>
        )
      },
      { 
        field: "status", 
        headerName: "Status", 
        flex: 1,
        renderCell: (params) => (
          <span
            variant="outlined"
            style={{
              borderRadius: "20px",
              border: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%"
            }}>
            <CustomStatus status={params.row.status} color={getStatusColor(params.row.status)} />
          </span>
        )
      },
    ];

    return (
        <>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={60000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
            action={copyPasswordAction}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          />
          <TestCycleReportDialog 
            open={openTestCycleReportDialog} 
            setOpen={setOpenTestCycleReportDialog} 
            s3Url={s3Url} 
            testCycleResultId={selectedTestCycleResultId} />

          <Box sx={{ mb: 4, mt: -6, display: "flex", justifyContent: "flex-end" }}>
              {(selectedDomain && executionHistory.length > 0) && (
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Test Execution ID or Name"
                    sx={{ mr: 2, width: 300 }}
                    onChange={(() => {
                        let timeout;
                        return (e) => {
                            const value = e.target.value.toLowerCase();
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                if (value === "") {
                                    setFilteredExecutions([]);
                                    return;
                                }
                                const filtered = executionHistory.filter(
                                    (tc) =>
                                        tc.test_cycle_result_id.toString().includes(value) ||
                                        tc.test_cycle_name.toLowerCase().includes(value)
                                );                                    
                                setFilteredExecutions(filtered);
                            }, 300);
                        };
                    })()}
                />
            )}
            <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                disabled={selectedDomain === ""}
                startIcon={<Replay />}
                onClick={() => {
                    fetchTCsAndExecutionHistory(selectedDomain);
                }}>
                Refresh
            </Button>
          </Box>

          <DataGrid
              autoHeight
              getRowId={(row) => row.test_cycle_result_id}
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } }
              }}
              pagination
              rows={filteredExecutions.length > 0 ? filteredExecutions : executionHistory}
              columns={executionColumns}             
              slots={{ noRowsOverlay: CustomNoRowsOverlay }}
          />

          {/* Modal for test case details */}
          <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="test-cases-modal-title"
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
                minWidth: 800,
                borderRadius: 2,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <Typography id="test-cases-modal-title" variant="h6" mb={2}>
                Test Cases Execution Details
              </Typography>
              <DataGrid
                autoHeight
                rows={testCasesListData}
                columns={testCaseColumns}
                getRowId={(row) => row.test_case_id}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5, page: 0 } }
                }}
                pagination
                sx={{ mb: 2 }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No test cases found for this execution.
                      </Typography>
                    </Box>
                  ),
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="outlined" onClick={() => setOpenModal(false)}>
                  Close
                </Button>
              </Box>
            </Box>
          </Modal>
        </>
    );
}

export default ExecutionHistory;

function CustomNoRowsOverlay() {
  return (
    <>
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Please select domain or No Executions available for the selected domain.
        </Typography>
      </Box>
    </>
  );
}