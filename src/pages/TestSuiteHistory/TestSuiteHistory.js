import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  TextField,
  ListItemIcon,
  TablePagination,
  Collapse,
  Checkbox,
  FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import { AddCircle, Search as SearchIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useGetTestSuitMutation,
  useDeleteTestSuiteMutation,
  useUpdateTestSuiteMutation,
  useBulkUploadTestCaseStatusMutation,
  useDownloadBulkUploadTemplateMutation,
  useGetTestCaseListMutation,
} from "../../store/mdtSlice";
import { closeLoading, showLoading, showSnackbar, openDialog } from "../../store/appSlice";
import TestSuiteDialog from "../../components/TestSuiteDialog/TestSuiteDialog";
import * as classes from "./TestSuiteHistory.module.css";
import {
  checkUserAccess,
  sortDataInDecOrder,
  showReadOnlySnackbar,
  consoleLog,
  getDataFromStorage,
} from "../../utils/utility";
import BulkUploadDialog from "../BulkUpload/BulkUpload";
import BulkUploadStatusContent from "../../components/BulkUploadStatusContent";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { List, ListItem, ListItemText } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { RenderTestSuites } from "./RenderTestSuites";
import { TestSuiteHistoryTableHeader } from "./TestSuiteHistoryTableHeader";

const TestSuiteHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedOrgAppDetails } = useSelector((state) => state.data);
    const [testSuites, setTestSuites] = useState([]);
  const [totalSuitesCount, setTotalSuitesCount] = useState(0);
    const [searchTestSuite, setSearchTestSuite] = useState("");
    const accessCheck = checkUserAccess();
    const [loading, setLoading] = useState(true);
    const [testSuiteDialogOpen, setTestSuiteDialogOpen] = useState(false);
    const [testSuiteDetails, setTestSuiteDetails] = useState({ id: "", name: "", description: "" });
    const [isRequired, setIsRequired] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [nestedMenuAnchorEl, setNestedMenuAnchorEl] = useState(null);
    const [bulkUploadOpen, setOpenBulkUploadOpen] = useState(false);
    const [getTestSuit] = useGetTestSuitMutation();
    const [deleteTestSuite] = useDeleteTestSuiteMutation();
    const [updateTestSuite] = useUpdateTestSuiteMutation();
    const [bulkUploadStatus, setBulkUploadStatus] = useState(null);
    const [bulkUploadTestCaseStatus] = useBulkUploadTestCaseStatusMutation();
    const [openBulkUploadStatusDialog, setOpenBulkUploadStatusDialog] = useState(false);
    const [type, setType] = useState(null);
    const [progress, setProgress] = useState(0);
    const [fileContent, setFileContent] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [openedAccordion, setOpenedAccordion] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [suiteToDelete, setSuiteToDelete] = useState(null);
    const [retainTestCases, setRetainTestCases] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(searchTestSuite);

  const [ downloadBulkUploadTemplate ] = useDownloadBulkUploadTemplateMutation();
    const [ getTestCaseList ] = useGetTestCaseListMutation();
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTestSuite);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTestSuite]);

  useEffect(() => {
    if(selectedOrgAppDetails.orgName !== "" && selectedOrgAppDetails.appName !== "") {
      fetchAllSuitesAndCases({debouncedSearch});
    }
  }, [dispatch, getTestSuit, selectedOrgAppDetails, page, pageSize, debouncedSearch]);

  const fetchAllSuitesAndCases = async ({debouncedSearch}) => {    
    try {
      const searchTestSuite = debouncedSearch;
      let searchWord = undefined;
      if(searchTestSuite !== ""){
        searchWord = isNaN(parseInt(searchTestSuite)) ? searchTestSuite : parseInt(searchTestSuite);
      }
      
      const { data: response, error } = await getTestCaseList({
        function_name: "get-suite-cases",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        user_id: sessionStorage.getItem("username"),
        search_word: searchWord
      });
      if (response && response.body && response.statusCode === 200) {
        setTestSuites(response.body.data);
        setTotalSuitesCount(response.body.overll_test_suite_count);
        setLoading(false);
      }
      if (!!error) throw error;
      } catch (error) {
          console.error("Failed to fetch test suites: ", error);
      }
  }

  useEffect(() => {
    getStatus();
  }, [type]);

  const getStatus = () => {
    if (type === "Bulk Upload") {
      setProgress(0);
      dispatch(showLoading());
      const interval = setInterval(async () => {
        try {
          const user_id = sessionStorage.getItem("username");
          const { data: response, error } = await bulkUploadTestCaseStatus({
            function_name: "falcon-create-bulk-tc/get-status",
            user_id,
            fileName: `${user_id.split("@")[0]}.xlsx`,
          });
          if (response.status === "process_completed") {
            clearInterval(interval);
            setBulkUploadStatus(response);
            setProgress(100);
            setType("");
            dispatch(closeLoading());
            setOpenBulkUploadStatusDialog(true);
          } else {
            setProgress((prevProgress) => {
              const newProgress = Math.min(prevProgress + 25, 100);
              return newProgress;
            });
          }
          if (error) throw error;
        } catch (error) {
          console.error("Failed to fetch bulk upload status: ", error);
          clearInterval(interval);
          dispatch(closeLoading());
          setType("");
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  };

  const handleDeleteTestSuiteConfirmation = (testsuite) => {
    if (accessCheck) {
      const confirmDialog = {
        open: true,
        titleText: "Delete Confirmation",
        innerText: `Are you sure you want to Delete Test Suite - ${testsuite.test_suite_name}?`,
        buttonText: {
          cancel: "Cancel",
          confirm: "Confirm",
        },
        onConfirm: () => {
          handleDeleteTestSuite(testsuite.test_suite_id, event);
        },
        onCancel: () => {
          consoleLog("info", "dialog close");
        },
      };
      dispatch(openDialog(confirmDialog));
    } else {
      showReadOnlySnackbar(dispatch);
    }
  };

  const handleDeleteTestSuite = async (id, event) => {
    event.stopPropagation();
    try {
      const { data: response, error } = await deleteTestSuite({
        function_name: "test-suite-delete",
        user_id: sessionStorage.getItem("username"),
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        test_suite_id: id,
      });
      if (response && response.statusCode === 200) {
        fetchAllSuitesAndCases({debouncedSearch});
        dispatch(
          showSnackbar({
            message: response?.message,
            className: "color-success-background width-50",
          })
        );
        handleClose();
      } else {
        dispatch(
          showSnackbar({
            message: response?.message,
            className: "color-error-background width-50",
          })
        );
      }

      if (error) {
        console.error("Error deleting test suite:", error);
      }
    } catch (error) {
      console.error("Error deleting test suite:", error);
    }
  };

  const handleEditTestSuite = (testsuite) => {
    setTestSuiteDetails({
      id: testsuite.test_suite_id,
      name: testsuite.test_suite_name,
      description: testsuite.test_suite_desc,
    });
    setTestSuiteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setTestSuiteDialogOpen(false);
    setIsRequired(false);
  };

  const navigateToPage = (path) => {
    if (accessCheck) {
      navigate(`/${path}`, {
        state: {
          getTestSuitInfo: testSuites,
        },
      });
    } else {
      showReadOnlySnackbar(dispatch);
    }
  };

  const saveTestSuite = async () => {
    dispatch(showLoading());
    try {
      const { data: response, error } = await updateTestSuite({
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        test_suite_id: testSuiteDetails.id,
        test_suite_name: testSuiteDetails.name,
        test_suite_description: testSuiteDetails.description,
        user_id: sessionStorage.getItem("username"),
        function_name: "test-suite-modify",
      });
      if (response.statusCode === 200) {
        const updatedTestSuites = testSuites.map((testsuite) =>
          testsuite.id === testSuiteDetails.id
            ? {
                ...testsuite,
                name: testSuiteDetails.name,
                description: testSuiteDetails.description,
              }
            : testsuite
        );
        setTestSuites(updatedTestSuites);
        dispatch(
          showSnackbar({
            message: response?.message,
            className: "color-success-background width-50",
          })
        );
        setTestSuiteDialogOpen(false);
      } else {
        dispatch(
          showSnackbar({
            message: response?.message,
            className: "color-error-background width-50",
          })
        );
      }
      if (error) {
        console.error("Error editing test suite:", error);
      }
    } catch (error) {
      console.error("Error editing test suite:", error);
    }
    dispatch(closeLoading());
  };

  const downloadFile = async () => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await downloadBulkUploadTemplate({
        function_name: "get-bulk-upload-templet",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        user_id: sessionStorage.getItem("username"),
      });			

      if (response && response.statusCode === 200) {
        const link = document.createElement("a");
        link.href = response.body;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
        dispatch(closeLoading())
      } else {
        dispatch(closeLoading())
        dispatch(
          showSnackbar({
            message: response.body,
            className: "color-error-background width-50",
          })
        );
      }
    } catch (error) {
      dispatch(closeLoading())
      console.error("Error downloading test cases Report:", error);
    }
  };

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  let timeoutId = null;

  const handleClose = () => {
    if (!!timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setAnchorEl(null);
      setNestedMenuAnchorEl(null);
      setExpanded(false);
    }, 0);
  };

  const handleMenuEnter = () => {
    if (!!timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const handleExpandToggle = () => setExpanded(!expanded);

  const handleAccordionClick = (testSuiteId) => {
    if (openedAccordion === testSuiteId) {
      setOpenedAccordion(null);
    } else {
      setOpenedAccordion(testSuiteId);
    }
  };

  const handleSearch = (e) => {
    setSearchTestSuite(e.target.value) 
  };
  
  return (
    <Paper elevation={0} sx={{mt: 2}} className={classes.root}>
      <Grid item xs={12} sm={6} className={classes.item}>
        <Box>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTestSuite}
            onChange={handleSearch}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <div style={{ marginLeft: 20 }}>
          <Button
            className={classes.btn}
            variant="contained"
            size="small"
            endIcon={<AddCircle />}
            onMouseEnter={handleClick}
            onMouseLeave={handleClose}
            sx={{ zIndex: Boolean(anchorEl) ? (theme) => theme.zIndex.modal + 1 : 1 }}
          >
            Create Test Cases
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            MenuListProps={{
              onMouseLeave: handleClose,
              onMouseEnter: handleMenuEnter,
            }}
          >
            <MenuItem
              sx={{ fontSize: "small" }}
              onClick={() => navigateToPage("testsuite/testcase-create")}
            >
              Create New Test Case
            </MenuItem>
            <MenuItem onClick={handleExpandToggle} sx={{ fontSize: "small", paddingRight: "1px" }}>
              Create Bulk Test Case
              {expanded ? <ExpandLess sx={{ pl: "8px" }} /> : <ExpandMore sx={{ pl: "8px" }} />}
            </MenuItem>
            <Collapse in={expanded}>
              <List sx={{ p: "0" }}>
                <ListItem sx={{ py: "1px" }} button onClick={() => setOpenBulkUploadOpen(true)}>
                  <ListItemIcon sx={{ minWidth: "0px" }}>
                    <FileUploadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Upload File"
                    primaryTypographyProps={{ fontSize: "13px", pl: 2 }}
                  />
                </ListItem>
                <ListItem button sx={{ py: "1px" }} onClick={downloadFile}>
                  <ListItemIcon sx={{ minWidth: "0px" }}>
                    <FileDownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Download Template"
                    primaryTypographyProps={{ fontSize: "13px", pl: 2 }}
                  />
                </ListItem>
              </List>
            </Collapse>
            <MenuItem
              sx={{ fontSize: "small" }}
              onClick={() => navigateToPage("testsuite/question-generate")}
            >
              Create Question Based Test Case (Iris)
            </MenuItem>
          </Menu>
        </div>
      </Grid>

      <div>
        <TestSuiteHistoryTableHeader />

        <RenderTestSuites
          filteredTestSuites={testSuites}
          testSuites={testSuites}
          handleEditTestSuite={handleEditTestSuite}
          handleDeleteTestSuiteConfirmation={handleDeleteTestSuiteConfirmation}
          handleAccordionClick={handleAccordionClick}
          openedAccordion={openedAccordion}
          loading={loading}
          type={type}
          fileContent={fileContent}
          progress={progress}
        />
      </div>

      <RenderPagination
        totalCount={totalSuitesCount}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <TestSuiteDialog
        open={testSuiteDialogOpen}
        handleClose={handleCloseDialog}
        saveTestSuite={saveTestSuite}
        testSuiteDetailes={testSuiteDetails}
        setTestSuiteDetailes={setTestSuiteDetails}
        title="Edit Test Suite"
        isRequired={isRequired}
        setIsRequired={setIsRequired}
      />
      
      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={setOpenBulkUploadOpen}
        setType={setType}
        fileContent={fileContent}
        setFileContent={setFileContent}
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to Delete Test Suite - {suiteToDelete?.test_suite_name}?
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox 
                checked={retainTestCases} 
                onChange={(e) => setRetainTestCases(e.target.checked)} 
              />
            }
            label="Do you want to retain testcases?"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTestSuite} color="error" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      <BulkUploadStatusContent
        setOpenBulkUploadStatusDialog={setOpenBulkUploadStatusDialog}
        openBulkUploadStatusDialog={openBulkUploadStatusDialog}
        bulkUploadStatus={bulkUploadStatus}
      />
    </Paper>
  );
};

export default TestSuiteHistory;

export const RenderPagination = ({totalCount, page, pageSize, setPage, setPageSize}) => {
  return (
    <TablePagination
      component="div"
      count={totalCount}
      page={page - 1}
      onPageChange={(event, newPage) => setPage(newPage + 1)}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[5, 10, 25]}
      onRowsPerPageChange={(event) => setPageSize(+event.target.value)}
    />
  );
};