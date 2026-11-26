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
import { useBulkUploadFalconLiteTestCasesMutation } from "../../store/mdtSlice";
import { useDispatch } from "react-redux";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { Delete } from "@mui/icons-material";
import { getDataFromStorage } from "../../utils/utility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { FALCON_API } from "../../../environment";

const BulkUploadFalconLite = ({ open, onClose, fileContent, setFileContent, selectedDomain }) => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRowsNexus, setSelectedRowsNexus] = useState([]);
  const [missingSheetsError, setMissingSheetsError] = useState(false);

  const [bulkUploadFalconLiteTestCases] = useBulkUploadFalconLiteTestCasesMutation();

  useEffect(() => {
    if (selectedFile) {
      readFileContent(selectedFile);
    }
  }, [selectedFile]);

  const handleClose = () => {
    onClose(false);
    setSelectedFile(null);
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
      // Use cellDates: true and raw: true to preserve all data, including hidden columns
      const workbook = XLSX.read(bstr, { type: "array", cellDates: true, raw: true });

      const requiredSheets = ["nexus"];
      const sheetNames = workbook.SheetNames;

      const missingSheets = requiredSheets.filter((sheet) => !sheetNames.includes(sheet));
      setMissingSheetsError(missingSheets.length > 0);

      let sheetsData = {};
      requiredSheets.forEach((sheetName) => {
        const ws = workbook.Sheets[sheetName];
        // Use defval: null and include hidden columns by setting blankrows: false and using header: 1 to get all columns
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false });
        
        const headers = aoa[0];
        const questionToNexusIndex = headers.indexOf("question_to_nexus");

        let data = aoa.slice(1).filter((row) => {
            const value = row[questionToNexusIndex];
            return value != null && String(value).trim() !== "";
          }).map((row, index) => {
          const obj = {};
          headers.forEach((header, colIdx) => {
            if(header !== null && header !== undefined) {
              obj[header] = row[colIdx];
            }
          });
          obj.id = index;
          return obj;
        });
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

  const handleDeleteSelectedRows = () => {
    const updatedFileContent = { ...fileContent };
    if (fileContent["nexus"]) {
      // Use id directly from selectedRowsNexus (which is an array of row objects)
      const selectedIds = selectedRowsNexus.map(row => row.id);
      
      updatedFileContent["nexus"] = fileContent["nexus"].filter(
        (row) => !selectedIds.includes(row.id)
      );
      
    }
    setFileContent(updatedFileContent);
    setSelectedRowsNexus([]);
  };

  const columnsNexus = [
    {
      field: "domain_name",
      headerName: "Domain",
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
      field: "workspace_id",
      headerName: "Workspace ID",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "question_to_nexus",
      headerName: "Question To Nexus",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "expected_sql",
      headerName: "Expected SQL",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "connection_name",
      headerName: "Connection Name",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "connection_id",
      headerName: "Connection ID",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
    {
      field: "created_by",
      headerName: "Created By",
      width: 150,
      headerAlign: "center",
      align: "center",
      editable: true,
    },
  ];

  const processRowUpdate = (newRow, oldRow) => {
    const updatedRows = { ...fileContent };
    updatedRows["nexus"] = updatedRows["nexus"].map((row, index) =>
      index === newRow.id ? newRow : row
    );
    setFileContent(updatedRows);
    return newRow;
  };

  const handleRowSelectionNexus = (ids) => {
    const selectedRows = Array.from(ids.ids).map((id) => fileContent["nexus"].find((row) => row.id === id));    
    setSelectedRowsNexus(selectedRows);
  };

  const isFileContentValid = () => {
    return (
      fileContent["nexus"] && fileContent["nexus"].length > 0
    );
  };

  const handleUploadFile = async () => {
    dispatch(showLoading());
    try {
      const user_id = sessionStorage.getItem("username");
      const createPayloadBulkUpload = (testCases) => ({
        function_name: "falcon-lite-nexus-bulk-upload",
        user_id,
        domain_name: selectedDomain,
        test_cases: testCases["nexus"].map((testCase) => {
          const { domain_name, workspace_name, workspace_id, question_to_nexus, expected_sql, connection_name, connection_id, created_by } = testCase;
          return {
            domain_name,
            workspace_name,
            workspace_id,
            question_to_nexus,
            expected_sql,
            connection_name,
            connection_id,
            created_by,
          };
        }),
      });

      const bulkUploadTestCasePayload = createPayloadBulkUpload(fileContent);
      fetch(`${FALCON_API}/falcon-lite`, {
        method: "POST",
        body: JSON.stringify(bulkUploadTestCasePayload),
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
            dispatch(showSnackbar({
              message: "Test cases uploaded successfully",
              className: "color-success-background width-50",
            }));
            setFileContent({});
            setSelectedRowsNexus([]);
            setDrawerOpen(false);
          }
        })
        .catch((error) => {
          dispatch(showSnackbar({
            message: "Error uploading test cases",
            className: "color-error-background width-50",
          }));
          console.error("Error uploading test cases:", error);
        });
      
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
          onClick={() => handleDeleteSelectedRows()}
          disabled={selectedRowsNexus.length === 0}
        >
          Delete
        </Button>
      </div>

      <Box sx={{ width: "97%", margin: "10px auto !important" }} role="presentation">
        {fileContent["nexus"]?.length > 0 && (
          <Accordion defaultExpanded style={{ marginBottom: "10px" }}>
            <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
              <Typography fontFamily={"Inter"} fontWeight={"600"}>
                Nexus Test Cases
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ width: "100%" }}>
                <DataGrid
                  rows={fileContent["nexus"]}
                  columns={columnsNexus}
                  disableColumnMenu
                  rowHeight={35}
                  autoHeight
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                  }}
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
                marginLeft: "10px",
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
            {missingSheetsError && (
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
                  File must contain a 'nexus' sheet
                </Typography>
              </Box>
            )}
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
        // anchor="right"
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

export default BulkUploadFalconLite;
