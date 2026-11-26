import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Button ,Dialog ,DialogActions,DialogContent,DialogContentText,DialogTitle }from "@mui/material";
import { closeDialog } from "./../../store/appSlice";

const ConfirmDialog = () => {
  const dispatch = useDispatch();
  const { open, onConfirm, onCancel, titleText, innerText, buttonText } =
    useSelector((state) => state.app.confirmDialog);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    dispatch(closeDialog());
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
    dispatch(closeDialog());
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        style={{ zIndex: 9999 }}
      >
        <DialogTitle id="confirm-dialog-title">{titleText}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {innerText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{buttonText.cancel}</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleConfirm}
            autoFocus
          >
            {buttonText.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmDialog;
