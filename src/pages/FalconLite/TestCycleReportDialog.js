import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
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

const TestCycleReportDialog = ({
  open,
  setOpen,
  s3Url,
  testCycleResultId,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [testCycleReport, setTestCycleReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetNames, setSheetNames] = useState([]);
  const [columns, setColumns] = useState([]);
  const [verticalRows, setVerticalRows] = useState([]);
  const [verticalColumns, setVerticalColumns] = useState([
    { field: "header", headerName: "Field", flex: 1 },
    { field: "value", headerName: "Value", flex: 2 },
  ]);
  const dispatch = useDispatch();

  const handleClose = () => {
    setSelectedTab(0);
    setOpen(false);
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

        const filteredSheetNames = workbook.SheetNames;
        setSheetNames(filteredSheetNames);

        const selectedSheetName = filteredSheetNames[selectedTab];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[selectedSheetName], {
          defval: null,
        });

        // Transform the single row to vertical format
        let vertical = [];
        if (sheetData.length > 0) {
          const row = sheetData[0];
          vertical = Object.keys(row).map((key, idx) => ({
            id: idx,
            header: key,
            value: row[key],
          }));
        }
        setVerticalRows(vertical);
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
    // eslint-disable-next-line
  }, [open, selectedTab]);

    const downloadReport = async () => {
        try {
            const link = document.createElement("a");
            link.href = s3Url;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
            
            if(response.body.file_password !== null && response.body.file_password !== "None"){
                // setOpenSnackbar(true);
                // setSnackbarMessage(`Use this password to open the report: ${response.body.file_password}`);
                // setTextToCopy(response.body.file_password);
            }
            
        } catch (error) {
            console.error("Error downloading report:", error);
        }
    }

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
          ))}
        </Tabs>

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
            size="small"
            onClick={(event) => downloadReport(testCycleResultId, event)}
          >
            Download
          </Button>
        </div>
        <Box sx={{ height: "80vh", width: "100%" }}>
          {verticalRows.length > 0 ? (
            <DataGrid
              rows={verticalRows}
              columns={verticalColumns}
              hideFooterPagination
              hideFooter
              getRowHeight={() => "auto"}
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

export default TestCycleReportDialog;