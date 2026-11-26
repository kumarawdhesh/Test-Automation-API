import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch } from "react-redux";
import { closeLoading, showLoading } from "../../store/appSlice";
import * as XLSX from "xlsx";
import * as classes from "../TestCaseReport/TestCaseReportDialog.module.css";

const TestCaseReportDialog = ({
  open,
  setOpen,
  s3Url,
  testCaseResultId,
  handleFetchTestCaseReport,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [testCaseReport, setTestCaseReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetNames, setSheetNames] = useState([]);
  const [columns, setColumns] = useState([]);
  const [expandedCell, setExpandedCell] = useState({ rowId: null, field: null });

  const dispatch = useDispatch();

  const handleClose = () => {
    setSelectedTab(0);
    setOpen(false);
    setExpandedCell({ rowId: null, field: null });
  };

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const removeNullRows = (data) => {
    return data.filter((row) =>
      Object.values(row).some((value) => value !== null && value !== " ")
    );
  };

  const fetchDataFromS3 = async () => {
    try {
      dispatch(showLoading());
      const excelContent = await fetch(s3Url);
      const blob = await excelContent.blob();
      const reader = new FileReader();

      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const containsExactMatch = workbook.SheetNames.some((title) =>
          title.includes("Exact Match")
        );
        let filteredSheetNames = [];

        if (containsExactMatch) {
          filteredSheetNames = workbook.SheetNames;
        } else {
          filteredSheetNames = workbook.SheetNames.filter((title) => title.includes("Summary"));
        }

        setSheetNames(filteredSheetNames);

        const selectedSheetName = filteredSheetNames[selectedTab];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[selectedSheetName], {
          defval: null,
        });

        const cols =
          sheetData.length > 0
            ? Object.keys(sheetData[0]).map((key) => ({
                field: key,
                headerName: key.includes("SALES_QTY_source") ? "Source_SALES_QTY" : key.includes("SALES_QTY_target") ? "Target_SALES_QTY" : key,
                flex: 3,
                renderCell: (params) => (
                  <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {params.value}
                  </div>
                ),
              }))
            : [];

        setColumns(cols);
        setTestCaseReport(removeNullRows(sheetData));
        setLoading(false);
        dispatch(closeLoading());
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Error fetching data from S3:", error);
      dispatch(closeLoading());
    }
  };

  useEffect(() => {
    if (open) {
      fetchDataFromS3();
    }
  }, [open, selectedTab]);

  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      <IconButton
        onClick={handleClose}
        variant="contained"
        sx={{ position: "absolute", top: "0px", right: "0px", zIndex: 2000 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent style={{ position: "relative" }}>
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="secondary"
        >
          {sheetNames.map((title, index) => (
            <Tab key={index} label={title} />
            // <Typography>{title}</Typography>
          ))}
        </Tabs>

        {/* <Divider /> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            right: "30px",
            margin: "5px",
          }}
        >
          <Button
            variant="contained"
            endIcon={<GetAppIcon />}
            className={classes.btn}
            size="small"
            onClick={(event) => handleFetchTestCaseReport(testCaseResultId, event)}
          >
            Download
          </Button>
        </div>
        <Box sx={{ height: "80vh", width: "100%" }}>
          {testCaseReport.length > 0 ? (
            <DataGrid
              rows={testCaseReport.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              getRowHeight={() => "auto"}
              hideFooterPagination
              hideFooter
              sx={{
                ".MuiDataGrid-columnHeaders": {
                  background: "#d8d8d8 !important",
                  minHeight: "30px !important",
                  maxHeight: "30px !important",
                },
                ".MuiDataGrid-cell": {
                  alignItems: "flex-start",
                  padding: "10px 10px",
                },
              }}
            />
          ) : (
            "No Data Available"
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TestCaseReportDialog;
