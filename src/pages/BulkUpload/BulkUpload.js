import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import * as XLSX from "xlsx";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DataGrid } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as classes from "../BulkUpload/BulkUpload.module.css";
import { useBulkUploadTestCasesMutation, useGetTestSuitMutation } from "../../store/mdtSlice";
import { useDispatch, useSelector } from "react-redux";
import { closeLoading, showLoading, showSnackbar, openDialog } from "../../store/appSlice";
import { Delete, NearMe } from "@mui/icons-material";
import { consoleLog } from "../../utils/utility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const BulkUploadDialog = ({ open, onClose, setType, fileContent, setFileContent }) => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { selectedOrgAppDetails } = useSelector((state) => state.data);
  const [testSuites, setTestSuites] = useState([]);
  const [testSuitesFetched, setTestSuitesFetched] = useState(false);
  const [selectedRowsDataCheck, setSelectedRowsDataCheck] = useState([]);
  const [selectedRowsIris, setSelectedRowsIris] = useState([]);
  const [selectedRowsNexus, setSelectedRowsNexus] = useState([]);
  const [missingSheetsError, setMissingSheetsError] = useState(false); // Track error state

  const [bulkUploadTestCases] = useBulkUploadTestCasesMutation();
  const [getTestSuit] = useGetTestSuitMutation();

  useEffect(() => {
    if (selectedFile) {
      readFileContent(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (drawerOpen && !testSuitesFetched) {
      fetchTestSuites();
    }
  }, [drawerOpen]);

  const fetchTestSuites = async () => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getTestSuit({
        function_name: "get-test-suites",
        user_id: sessionStorage.getItem("username"),
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
      });
      if (response?.statusCode === 200) {
        setTestSuites(response.body.test_suites);
        setTestSuitesFetched(true);
      }
      if (error) throw error;
    } catch (error) {
      console.error("Failed to fetch test suites: ", error);
    } finally {
      dispatch(closeLoading());
    }
  };

  const handleClose = () => {
    onClose(false);
    setSelectedFile(null);
    setTestSuites([]);
    setTestSuitesFetched(false);
    setMissingSheetsError(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const readFileContent = (file) => {

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workbook = XLSX.read(bstr, { type: "array" });
      const requiredSheets = ["data check", "iris", "nexus"];
      const sheetNames = workbook.SheetNames;

      const missingSheets = requiredSheets.filter((sheet) => !sheetNames.includes(sheet));
      setMissingSheetsError(missingSheets.length > 0);
      let sheetsData = {};
      requiredSheets.forEach((sheetName) => {
        const ws = workbook.Sheets[sheetName];
        let data = XLSX.utils.sheet_to_json(ws, { defval: null });
        data = data.map((row, index) => ({
          ...row,
          id: row.id || index,
          user_id: sessionStorage.getItem("username"),
        }));
        sheetsData[sheetName] = data;
      });

      setFileContent(sheetsData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    handleClose();
    setDrawerOpen(true);
  };

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleDeleteTestSuiteConfirmation = (event) => {
    event.stopPropagation();
    const confirmDialog = {
      open: true,
      titleText: "Delete Confirmation",
      innerText: `Are you sure you want to Delete Test Case?`,
      buttonText: {
        cancel: "Cancel",
        confirm: "Confirm",
      },
      onConfirm: () => {
        handleDeleteSelectedRows();
      },
      onCancel: () => {
        consoleLog("info", "dialog close");
      },
    };
    dispatch(openDialog(confirmDialog));
  };

  const handleDeleteSelectedRows = () => {
    const updatedFileContent = { ...fileContent };
    if (fileContent["data check"]) {
      console.log("Deleting from data check:", selectedRowsDataCheck);
      updatedFileContent["data check"] = fileContent["data check"].filter(
        (row) => !selectedRowsDataCheck.some((selected) => selected.id === row.id)
      );
    }
    if (fileContent["iris"]) {
      console.log("Deleting from iris:", selectedRowsIris);
      updatedFileContent["iris"] = fileContent["iris"].filter(
        (row) => !selectedRowsIris.some((selected) => selected.id === row.id)
      );
    }
    if (fileContent["nexus"]) {
      console.log("Deleting from nexus:", selectedRowsNexus);
      updatedFileContent["nexus"] = fileContent["nexus"].filter(
        (row) => !selectedRowsNexus.some((selected) => selected.id === row.id)
      );
    }
    setFileContent(updatedFileContent);
    setSelectedRowsDataCheck([]);
    setSelectedRowsIris([]);
  };

  const getRowHeight = () => {
    if (fileContent["iris"]?.length === 0 || fileContent["data check"]?.length === 0 || fileContent["nexus"]?.length === 0) {
      return 393;
    }
    if (fileContent["iris"]?.length < 10 || fileContent["data check"]?.length < 10 || fileContent["nexus"]?.length < 10) {
      return "auto";
    }

    return 393;
  };

  const columns = [
    { 
      field: "S.No", 
      headerName: "S.No", 
      width: 70, 
      headerAlign: "center", 
      align: "center" 
    },
     {
      field: "domain_name",
      headerName: "Domain Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "sub_domain_name",
      headerName: "Sub Domain Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testSuiteName",
      headerName: "Test Suite Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testCaseName",
      headerName: "Test Case Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    // {
    //   field: "testCaseDescription",
    //   headerName: "Test Case Description",
    //   width: 150,
    //   headerAlign: "center",
    //   align: "center",
    //   editable: true,
    // },
    // {
    //   field: "sourceConnectionType",
    //   headerName: "Source Connection Type",
    //   width: 150,
    //   headerAlign: "center",
    //   align: "center",
    //   editable: true,
    // },
    {
      field: "IrisVersion",
      headerName: "Iris Version",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "test_type",
      headerName: "Test Type",
      width: 180,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "iteration",
      headerName: "Iteration",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "databaseConnection",
      headerName: "Database Connection",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "domain",
      headerName: "Domain",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "Question_to_IRIS",
      headerName: "Question To IRIS",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "Expected_SQL",
      headerName: "Expected SQL",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
  ];

  const columnsDataCheck = [
    { 
      field: "S.No", 
      headerName: "S.No", 
      width: 70, 
      headerAlign: "center", 
      align: "center" 
    },
    {
      field: "domain_name",
      headerName: "Domain",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "sub_domain_name",
      headerName: "Sub Domain Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testSuiteName",
      headerName: "Test Suite Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testCaseName",
      headerName: "Test Case Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testCaseDescription",
      headerName: "Test Case Description",
      width: 180,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "test_type",
      headerName: "Test Type",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "test_scenario",
      headerName: "Test Scenario",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "sourceConnection",
      headerName: "Source Connection",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "sourceConnectionType",
      headerName: "Source Connection Type",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "targetsourceConnection",
      headerName: "Target Connection",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "targetConnectionType",
      headerName: "Target Connection Type",
      width: 190,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "SourceSQL",
      headerName: "Source Sql",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "TargetSQL",
      headerName: "Target Sql",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "KeyColumns",
      headerName: "Key Columns",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
  ];

  const columnsNexus = [
    { 
      field: "S.No", 
      headerName: "S.No", 
      width: 70, 
      headerAlign: "center", 
      align: "center" 
    },
    {
      field: "domain_name",
      headerName: "Domain",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "sub_domain_name",
      headerName: "Sub Domain Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testSuiteName",
      headerName: "Test Suite Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "testCaseName",
      headerName: "Test Case Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "test_type",
      headerName: "Test Type",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "workspace_name",
      headerName: "Workspace Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "Question_to_Nexus",
      headerName: "Question To Nexus",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "Expected_SQL",
      headerName: "Expected SQL",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "sourceConnection",
      headerName: "Source Connection",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "keyColumns",
      headerName: "Key Columns",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    }
  ];

  const processRowUpdate = (newRow, oldRow) => {
    const updatedRows = { ...fileContent };
    let sheetName = "data check";
    if(newRow.hasOwnProperty("IrisVersion")) {
      sheetName = "iris";
    } 
    if(newRow.hasOwnProperty("workspace_name")) {
      sheetName = "nexus";
    }

    updatedRows[sheetName] = updatedRows[sheetName].map((row, index) =>
      index === newRow.id ? newRow : row
    );

    setFileContent(updatedRows);
    return newRow;
  };

  const handleRowSelectionDataCheck = (ids) => {
    const selectedRows = ids.map((id) => fileContent["data check"].find((row) => row.id === id));
    setSelectedRowsDataCheck(selectedRows);
  };

  const handleRowSelectionIris = (ids) => {
    const selectedRows = ids.map((id) => fileContent["iris"].find((row) => row.id === id));
    setSelectedRowsIris(selectedRows);
  };

  const handleRowSelectionNexus = (ids) => {
    const selectedRows = ids.map((id) => fileContent["nexus"].find((row) => row.id === id));
    setSelectedRowsNexus(selectedRows);
  };

  const isFileContentValid = () => {
    return (
      (fileContent["data check"] && fileContent["data check"].length > 0) ||
      (fileContent["iris"] && fileContent["iris"].length > 0) ||
      (fileContent["nexus"] && fileContent["nexus"].length > 0)
    );
  };

  const handleUploadFile = async () => {
    dispatch(showLoading());
    try {
      const user_id = sessionStorage.getItem("username");
      const createPayloadBulkUpload = (testCases) => ({
        function_name: "falcon-create-bulk-tc",
        user_id,
        bulk_upload: {
          Iris: testCases.iris,
          DataCheck: testCases["data check"],
          Nexus: testCases["nexus"] || [],
          fileName: `${user_id.split("@")[0]}.xlsx`,
        },
      });

      const bulkUploadTestCasePayload = createPayloadBulkUpload(fileContent);
      const { data: response, error } = await bulkUploadTestCases(bulkUploadTestCasePayload);

      if (response && response.statusCode === 200) {
        setDrawerOpen(false);
        setType("Bulk Upload");
      } else {
        dispatch(
          showSnackbar({
            message: response.body,
            className: "color-error-background width-50",
          })
        );
      }
      if (error) throw error;
    } catch (error) {
      console.error("Failed to upload file: ", error);
    } finally {
      dispatch(closeLoading());
    }
  };

  const DrawerList = (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 10,
          display: "flex",
          justifyContent: "right",
          marginRight: "16px",
          marginTop: "10px",
        }}
      >
        <Button
          variant="contained"
          startIcon={<Delete />}
          size="small"
          onClick={(event) => handleDeleteTestSuiteConfirmation(event)}
          disabled={selectedRowsDataCheck.length === 0 && selectedRowsIris.length === 0 && selectedRowsNexus.length === 0}
        >
          Delete
        </Button>
      </div>

      <Box sx={{ width: "97%", margin: "10px auto !important" }} role="presentation">
        {fileContent["data check"]?.length > 0 && (
          <Accordion defaultExpanded style={{ marginBottom: "10px" }}>
            <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
              <Typography fontFamily={"Inter"} fontWeight={"600"}>
                Data Test Cases
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ height: getRowHeight(), width: "100%" }}>
                <DataGrid
                  rows={fileContent["data check"]}
                  columns={columnsDataCheck}
                  disableColumnMenu
                  rowHeight={35}
                  hideFooter
                  hideFooterPagination
                  processRowUpdate={processRowUpdate}
                  sx={{
                    ".css-1a12hj3-MuiToolbar-root-MuiTablePagination-toolbar": {
                      background: "white !important",
                      color: "black !important",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#d8d8d8",
                      minHeight: "40px !important",
                      maxHeight: "40px !important",
                    },
                    ".MuiSelect-icon": {
                      color: "white",
                    },
                  }}
                  localeText={{ noRowsLabel: "No Test Case Found" }}
                  checkboxSelection={fileContent["data check"]?.length > 0}
                  onRowSelectionModelChange={handleRowSelectionDataCheck}
                  selectionModel={selectedRowsDataCheck.map((row) => row.id)}
                />
              </div>
            </AccordionDetails>
          </Accordion>
         )} 
        {fileContent["iris"]?.length > 0 && (
          <Accordion defaultExpanded style={{ marginBottom: "10px" }}>
            <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
              <Typography fontFamily={"Inter"} fontWeight={"600"}>
                Iris Test Cases
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ height: getRowHeight(), width: "100%" }}>
                <DataGrid
                  rows={fileContent.iris}
                  columns={columns}
                  disableColumnMenu
                  rowHeight={35}
                  hideFooter
                  hideFooterPagination
                  processRowUpdate={processRowUpdate}
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#d8d8d8",
                      minHeight: "40px !important",
                      maxHeight: "40px !important",
                    },
                    ".MuiSelect-icon": {
                      color: "white",
                    },
                  }}
                  localeText={{ noRowsLabel: "No Test Case Found" }}
                  checkboxSelection={fileContent["iris"]?.length > 0}
                  onRowSelectionModelChange={handleRowSelectionIris}
                  selectionModel={selectedRowsIris.map((row) => row.id)}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        )}
        {fileContent["nexus"]?.length > 0 && (
          <Accordion defaultExpanded style={{ marginBottom: "10px" }}>
            <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
              <Typography fontFamily={"Inter"} fontWeight={"600"}>
                Nexus Test Cases
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ height: getRowHeight(), width: "100%" }}>
                <DataGrid
                  rows={fileContent["nexus"]}
                  columns={columnsNexus}
                  disableColumnMenu
                  rowHeight={35}
                  hideFooter
                  hideFooterPagination
                  processRowUpdate={processRowUpdate}
                  sx={{
                    ".css-1a12hj3-MuiToolbar-root-MuiTablePagination-toolbar": {
                      background: "white !important",
                      color: "black !important",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#d8d8d8",
                      minHeight: "40px !important",
                      maxHeight: "40px !important",
                    },
                    ".MuiSelect-icon": {
                      color: "white",
                    },
                  }}
                  localeText={{ noRowsLabel: "No Test Case Found" }}
                  checkboxSelection={fileContent["nexus"]?.length > 0}
                  onRowSelectionModelChange={handleRowSelectionNexus}
                  selectionModel={selectedRowsNexus.map((row) => row.id)}
                />
              </div>
            </AccordionDetails>
          </Accordion>
         )} 
        <div style={{ marginTop: "10px", textAlign: "end" }}>
          <Box sx={{ marginBottom: "20px", textAlign: "end" }}>
            <Button
              variant="contained"
              size="small"
              className={"btn"} 
              sx={{
                // backgroundColor: !isFileContentValid() ? "#e0e0e0" : "rgb(63, 184, 2)",
                // color: "white",
                textTransform: "capitalize",
                marginX: "10px",
                // "&:hover": {
                //   backgroundColor: "#3fb802e8",
                //   color: "white",
                // },
              }}
              onClick={handleUploadFile}
              disabled={!isFileContentValid()}
            >
              Proceed
            </Button>
            <Button
              variant="outlined"
              size="small"
              style={{
                color: "#404040",
                marginRight: "10px",
                backgroundColor: "#3fb80208",
              }}
              onClick={toggleDrawer(false)}
            >
              Close
            </Button>
          </Box>
        </div>
      </Box>
    </>
  );

  return (
    <>
      <Dialog
        onClose={handleClose}
        maxWidth={"sm"}
        open={open}
        style={{ zIndex: 9999 }}
        sx={{
          "& .MuiDialog-paper": {
            overflowX: "hidden",
            maxWidth: "400px",
            width: "80%",
            maxHeight: "400px",
          },
        }}
      >
        <DialogTitle fontWeight={500} variant="h5">
          Import File
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <>
          <DialogContent sx={{ padding: "14px 14px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="file"
                onChange={handleFileChange}
                id="fileInput"
                style={{ display: "none" }}
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
              <Button
                onClick={() => document.getElementById("fileInput").click()}
                size="small"
                style={{
                  color: "#404040",
                  marginRight: "10px",
                  border: "3px dotted #c5c5c5",
                  width: "100%",
                  height: "130px",
                  backgroundColor: "#3fb80208",
                  margin: "0",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "36%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <CloudUploadIcon sx={{ color: "#a5a5a5" }} />
                </Box>
                Choose File
              </Button>
            </div>
            <Typography
              sx={{
                fontSize: "14px",
                borderRadius: "5px",
                padding: "5px",
                marginTop: "8px",
                backgroundColor: "#f3f5f7",
                border: "1px solid #d8d8d8",
              }}
              variant="body1"
              color="textSecondary"
              noWrap
            >
              {selectedFile ? `${selectedFile.name}` : "No file selected"}
            </Typography>
            {missingSheetsError &&
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "red",
                mt: 1,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 16, mr: 1 }} />
              <Typography variant="subtitle2" color="red">
                File is not uploaded due to invalid file data
              </Typography>
            </Box>}
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              sx={{ border: "1px solid #c5c5c5" }}
              onClick={handleClose}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              endIcon={<FileUploadIcon />}
              size="small"
              sx={{
                backgroundColor:
                  !selectedFile || !isFileContentValid() ? "#e0e0e0" : "rgb(63, 184, 2)",
                color: "white",
                marginX: "10px",
                "&:hover": {
                  backgroundColor: "#3a9a0a",
                },
              }}
              disabled={!selectedFile || !isFileContentValid()}
            >
              Import
            </Button>
          </DialogActions>
        </>
      </Dialog>
      <Drawer
        anchor="right"
        style={{ zIndex: 1500, marginTop: "55px !important", marginBottom: "55px !important" }}
        sx={{
          "&.MuiDrawer-root .MuiDrawer-paper": {
            marginTop: "55px",
            height: "82vh !important",
            width: "100% !important",
          },
          marginBottom: "55px",
        }}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {DrawerList}
      </Drawer>
    </>
  );
};


export default BulkUploadDialog;