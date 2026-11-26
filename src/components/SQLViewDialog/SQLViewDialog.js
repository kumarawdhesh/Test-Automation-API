import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../store/appSlice";
import * as classes from "./SQLViewDialog.module.css";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
const SQLViewDialog = ({
  open,
  handleClose,
  queryContent,
  title,
  showCopy = false,
}) => {
  const dispatch = useDispatch();

  const handleCopy = () => {
    navigator.clipboard.writeText(queryContent);
    dispatch(
      showSnackbar({
        message: "Text copied successfully",
        className: "color-success-background width-50",
      })
    );
  };

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle
          sx={{ m: 0, p: 2 }}
          id="customized-dialog-title"
          className={classes.title}
        >
          {title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCopy}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <FileCopyOutlinedIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            <pre>{queryContent}</pre>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="success" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
};

export default SQLViewDialog;
