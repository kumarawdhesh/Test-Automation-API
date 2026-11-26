import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const formatResults = (results) =>
  results.map(({ message, body, testSuiteName, testCaseName }) => ({
    message: message || body, 
    testSuiteName,
    testCaseName,
  }));

const BulkUploadStatusContent = ({
  setOpenBulkUploadStatusDialog,
  openBulkUploadStatusDialog,
  bulkUploadStatus,
}) => {
  const [openItems, setOpenItems] = useState({});

  const handleToggle = (title) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };
  if (!bulkUploadStatus) {
    return null;
  }

  const irisResults = JSON.parse(bulkUploadStatus?.iris_results || "[]");
  const datacheckResults = JSON.parse(bulkUploadStatus?.data_check_results || "[]");
  const nexusResults = JSON.parse(bulkUploadStatus?.nexus_results || "[]");

  const filteredIrisResults = irisResults.filter((item) => item.statusCode === 200);
  const filteredDataCheckResults = datacheckResults.filter((item) => item.statusCode === 200);
  const filteredNexusResults = nexusResults.filter((item) => item.statusCode === 200);

  const failedDataCheckResults = datacheckResults.filter((item) => item.statusCode !== 200);
  const failedIrisResults = irisResults.filter((item) => item.statusCode !== 200);
  const failedNexusResults = nexusResults.filter((item) => item.statusCode !== 200);

  const formattedFilteredIrisResults = formatResults(filteredIrisResults);
  const formattedFilteredDataCheckResults = formatResults(filteredDataCheckResults);
  const formattedFilteredNexusResults = formatResults(filteredNexusResults);

  const formattedFailedDataCheckResults = formatResults(failedDataCheckResults);
  const formattedFailedIrisResults = formatResults(failedIrisResults);
  const formattedFailedNexusResults = formatResults(failedNexusResults);

  const handleClose = () => {
    setOpenBulkUploadStatusDialog(false);
  };

  const renderResults = (title, results) => (
    <>
      {results.length > 0 ? (
        <List
          sx={{ width: "100%", bgcolor: "background.paper", padding: 0 }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          <ListItemButton sx={{ padding: 0 }} onClick={() => handleToggle(title)}>
            <ListItemText
              primaryTypographyProps={{
                fontWeight: "500",
                paddingX: "0",
                fontSize: "14px",
                paddingY: "0",
              }}
              sx={{ textDecoration: "underline" }}
              primary={title}
            />
            {openItems[title] ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openItems[title]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemText
                primary={
                  <Box sx={{}}>
                    {results.map((result, index) => (
                      <Box
                        key={index}
                        mb={2}
                        border={"1px solid #eaeaea"}
                        borderRadius={"2px"}
                        padding={1}
                      >
                        <Typography variant="body2">
                          <strong>Test Suite Name:</strong> {result.testSuiteName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Test Case Name:</strong> {result.testCaseName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Message:</strong> {result.message}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                }
              />
            </List>
          </Collapse>
        </List>
      ) : (
        ""
      )}
    </>
  );

  return (
    <Dialog
      onClose={handleClose}
      maxWidth={"md"}
      open={openBulkUploadStatusDialog}
      style={{ zIndex: 9999 }}
      sx={{
        "& .MuiDialog-paper": {
          overflowX: "hidden",
          maxWidth: "400px",
          width: "80%",
          minWidth: "600px",
          maxHeight: "455px",
        },
      }}
    >
      <DialogTitle>
        Bulk Upload Status
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
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginY: "5px",
            }}
          >
            <Typography sx={{ fontWeight: "500", fontSize: "14px", textDecoration: "underline" }}>
              Total Test Cases Processed:{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                border: "1px solid #c2e8ae",
                borderRadius: "3px",
                paddingX: "5px",
              }}
            >
              {bulkUploadStatus.total_data_check_count + bulkUploadStatus.total_iris_count + bulkUploadStatus.total_nexus_count}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginY: "5px",
            }}
          >
            <Typography sx={{ fontWeight: "500", fontSize: "14px", textDecoration: "underline" }}>
              Test Cases Created:{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                border: "1px solid #c2e8ae",
                borderRadius: "3px",
                paddingX: "5px",
              }}
            >
              {bulkUploadStatus.total_data_check_count + bulkUploadStatus.total_iris_count + bulkUploadStatus.total_nexus_count -
               bulkUploadStatus.data_check_error_count - bulkUploadStatus.iris_error_count - bulkUploadStatus.nexus_error_count}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginY: "5px",
            }}
          >
            <Typography sx={{ fontWeight: "500", fontSize: "14px", textDecoration: "underline" }}>
              Test Cases Creation Failed:{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                border: "1px solid #c2e8ae",
                borderRadius: "3px",
                paddingX: "5px",
              }}
            >
              {bulkUploadStatus.data_check_error_count + bulkUploadStatus.iris_error_count + bulkUploadStatus.nexus_error_count}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginY: "5px",
            }}
          >
            <Typography sx={{ fontWeight: "500", fontSize: "14px", textDecoration: "underline" }}>
              Data Test Cases Modification Count:{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                border: "1px solid #c2e8ae",
                borderRadius: "3px",
                paddingX: "5px",
              }}
            >
              {bulkUploadStatus.data_check_modify_count}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginY: "5px",
            }}
          >
            <Typography sx={{ fontWeight: "500", fontSize: "14px", textDecoration: "underline" }}>
              Iris Test Cases Modification Count:{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                border: "1px solid #c2e8ae",
                borderRadius: "3px",
                paddingX: "5px",
              }}
            >
              {bulkUploadStatus.iris_modify_count}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginY: "5px",
            }}
          >
            <Typography sx={{ fontWeight: "500", fontSize: "14px", textDecoration: "underline" }}>
              Nexus Test Cases Modification Count:{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                border: "1px solid #c2e8ae",
                borderRadius: "3px",
                paddingX: "5px",
              }}
            >
              {bulkUploadStatus.nexus_modify_count}
            </Typography>
          </Box>
          <Typography>
            {renderResults("Iris Test Cases Created", formattedFilteredIrisResults)}
            {renderResults("Data Test Cases Created", formattedFilteredDataCheckResults)}
            {renderResults("Nexus Test Cases Created", formattedFilteredNexusResults)}

            {renderResults("Data Test Cases Creation Failed", formattedFailedDataCheckResults)}
            {renderResults("Iris Test Cases Creation Failed", formattedFailedIrisResults)}
            {renderResults("Nexus Test Cases Creation Failed", formattedFailedNexusResults)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          sx={{ border: "1px solid rgb(63, 184, 2)", color: "black" }}
          size="small"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadStatusContent;
