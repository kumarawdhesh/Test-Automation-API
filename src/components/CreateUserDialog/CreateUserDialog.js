import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import * as classes from "./CreateUserDialog.module.css";

const CreateUserDialog = ({ open, handleClose }) => {
  const handleCancel = () => {
    handleClose();
  };

  const handleSave = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const email = formJson.email;
    console.log(email);
    handleClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-apartment"
        PaperProps={{
          component: "form",
          onSubmit: handleSave,
          style: {
            backgroundColor: "#F5FFF2",
          },
        }}
      >
        <DialogTitle id="edit-apartment" variant="h4">
          Create User
        </DialogTitle>
        <DialogContent>
          <TextField
            id="standard-basic"
            label="UserName"
            variant="standard"
            margin="dense"
            fullWidth
            required
            sx={{ "& .MuiFormLabel-asterisk": { color: "#FF0000" } }}
          />
          <TextField
            id="standard-basic"
            label="Email"
            variant="standard"
            type="email"
            margin="dense"
            fullWidth
            required
            autoFocus
            sx={{ "& .MuiFormLabel-asterisk": { color: "#FF0000" } }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="success" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" className={classes.btn} type="submit">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateUserDialog;
