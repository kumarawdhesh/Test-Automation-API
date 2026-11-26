import React from "react";
import {
  Dialog,
  Button,
  DialogActions,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";

const ConnectionDialog = ({ openPopup = false, handleCloseDropdownPopup }) => {
  return (
    <React.Fragment>
      <Dialog
        open={openPopup}
        onClose={handleCloseDropdownPopup}
        aria-labelledby="customized-dialog-title"
        sx={{
          "& .MuiDialog-paper": {
            overflowX: "hidden",
            maxWidth: "400px",
            width: "400px",
            height: "450px",
          },
        }}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, textAlign: "center" }}
          id="customized-dialog-title"
        >
          Select an Option
        </DialogTitle>
        <DialogContent
          dividers
          style={{
            display: "flex",
            flexDirection: "column",
            width: "auto",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> */}
          <Grid item spacing={3}>
            <FormControl
              sx={{ width: "30%" }}
              size="small"
              style={{ marginRight: "10px" }}
            >
              <InputLabel id="demo-simple-select-label">Select</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Select"
              >
                <MenuItem value={10}>column 1</MenuItem>
                <MenuItem value={20}>Column 2</MenuItem>
                <MenuItem value={30}>Column 3</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              onClick={() => console.log("Button clicked!")}
            >
              Equals
            </Button>
            <FormControl
              sx={{ width: "30%" }}
              size="small"
              style={{ marginRight: "10px" }}
            >
              <InputLabel id="demo-simple-select-label">Select</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Select"
              >
                <MenuItem value={10}>column 1</MenuItem>
                <MenuItem value={20}>Column 2</MenuItem>
                <MenuItem value={30}>Column 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* </div> */}
        </DialogContent>
        <DialogActions>
          <Button
            style={{ border: " 1px solid rgb(63, 184, 2)", color: "black" }}
            onClick={handleCloseDropdownPopup}
          >
            Cancel
          </Button>
          <Button
            style={{
              background: "rgb(63, 184, 2)",
              color: "white",
              margin: "9px 20px",
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ConnectionDialog;