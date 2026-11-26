import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import * as classes from "./TestSuiteDialog.module.css";

const TestSuiteDialog = ({ open, handleClose, saveTestSuite, testSuiteDetailes, setTestSuiteDetailes, title, isRequired, setIsRequired }) => {

  const handleSave = () => {
    if (!testSuiteDetailes.name || testSuiteDetailes.name.trim() === "") {
      setIsRequired(true);
      return;
    }
    saveTestSuite();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-apartment"
      PaperProps={{
        style: {
          backgroundColor: "#F5FFF2",
        },
      }}
      style={{ zIndex: 9999 }}
    >
      <DialogTitle id="edit-apartment" variant="h4">
        {title}
      </DialogTitle>
      <DialogContent>
        <TextField
          id="Test Suite Name"
          label="Test Suite Name"
          variant="standard"
          margin="dense"
          fullWidth
          required
          name="testSuiteName"
          value={testSuiteDetailes.name}
          autoFocus
          // inputProps={{ style: { textTransform: "uppercase" }, ref: inputRef }}
          onChange={(e) => {
            setTestSuiteDetailes({
              ...testSuiteDetailes,
              name: e.target.value,
            });
            setIsRequired(false);
          }}
          error={isRequired}
          helperText={isRequired ? "Test suite name should not be empty" : ""}
          sx={{
            "& .MuiFormLabel-root": {
              color: isRequired ? "rgba(0, 0, 0, 0.6)" : "",
            },
            "& .MuiFormLabel-asterisk": {
              color: "#FF0000",
            },
          }}
        />
        <TextField
          id="Test Suite Description"
          label="Test Suite Description"
          variant="standard"
          margin="dense"
          fullWidth
          name="testSuiteDesc"
          value={testSuiteDetailes.description}
          onChange={(e) => {
            setTestSuiteDetailes({
              ...testSuiteDetailes,
              description: e.target.value,
            });
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="success" onClick={handleClose}>
          Close
        </Button>
        <Button variant="contained" className={classes.btn} type="submit" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestSuiteDialog;
