import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, TableContainer, Table, TableRow, TableCell, Paper } from "@mui/material";

const ViewTestCaseDetailDialog = ({ open, handleClose, selectedTestCaseDetail }) => {  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-apartment"
      >
      <DialogTitle id="edit-apartment" variant="h4">
        {`Test Case Details`}
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
        <Table>
          <TableRow>
              <TableCell variant="head">Test Case ID</TableCell>
              <TableCell>{selectedTestCaseDetail?.test_case_id}</TableCell>
          </TableRow>
          <TableRow>
              <TableCell variant="head">Test Case Name</TableCell>
              <TableCell>{selectedTestCaseDetail?.test_case_name}</TableCell>
          </TableRow>
          <TableRow>
              <TableCell variant="head">Source Query</TableCell>
              <TableCell>{selectedTestCaseDetail?.source_query}</TableCell>
          </TableRow>
          <TableRow>
              <TableCell variant="head">Target Query</TableCell>
              <TableCell>{selectedTestCaseDetail?.target_query}</TableCell>
          </TableRow>
          <TableRow>
              <TableCell variant="head">Modification Reason</TableCell>
              <TableCell>{selectedTestCaseDetail?.modification_cause}</TableCell>
          </TableRow>
        </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="success" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTestCaseDetailDialog;
