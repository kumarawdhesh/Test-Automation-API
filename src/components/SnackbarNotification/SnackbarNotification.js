import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { hideSnackbar } from './../../store/appSlice';
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import IconButton from "@mui/material/IconButton";

const SnackbarNotification = () => {
  const {
    open,
    message,
    className,
    timer = 4000,
    mandateClose = false,
  } = useSelector((store) => store.app.snackbar);
  const dispatch = useDispatch();

  const customStyle = {
    top: "75px",
    paddingLeft: "25px",
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideSnackbar());
  };

  useEffect(() => {
    if (open && !mandateClose) {
      const timerVal = setTimeout(() => {
        handleCloseSnackbar(); // Close Snackbar after a specified duration
      }, timer);
      return () => clearTimeout(timerVal);
    }
  }, [open]);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={open}
      onClose={handleCloseSnackbar}
      message={message}
      style={customStyle}
      ContentProps={{
        className: className, // Add custom CSS class to the Snackbar content
      }}
      action={
        mandateClose && (
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        )
      }
    ></Snackbar>
  );
};

export default SnackbarNotification;
