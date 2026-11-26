import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ViewTestBaselineDialog = ({ open, handleClose, baselineData }) => {
  const steps = baselineData?.steps || [];
  const multiStepType = baselineData?.multi_step_type || "";

  const columns = [
    {
      field: "app_name",
      headerName: "App Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "env",
      headerName: "Environment",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "payload_format",
      headerName: "Payload Format",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "request_payload",
      headerName: "Request Payload",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
          {JSON.stringify(params.value)}
        </Box>
      ),
    },
    {
      field: "seq_no",
      headerName: "Sequence No",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="baseline-dialog-title"
    >
      <DialogTitle id="baseline-dialog-title">
        Test Baseline Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Step Type: {multiStepType === "sync" ? "Synchronous" : "Asynchronous"}
          </Typography>
        </Box>
        <DataGrid
          rows={steps}
          columns={columns}
          getRowId={(row) => row.multi_step_id || Math.random()}
          disableColumnMenu
          rowHeight={39}
          localeText={{
            noRowsLabel: "No steps found",
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          {...(steps.length < 5 && {
            hideFooterPagination: true,
            hideFooter: true,
          })}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#d8d8d8",
              minHeight: "40px !important",
              maxHeight: "40px !important",
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTestBaselineDialog;
