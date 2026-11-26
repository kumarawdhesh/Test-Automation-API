import React, { useState } from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField }from "@mui/material";

const ConfirmDialogWithReason = ({ open, onConfirm, onCancel }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState(false);

    const handleConfirm = () => {
        if (onConfirm) {
            if(reason !== ""){
                onConfirm(reason);
                setReason("");
            } else {
                setError(true);
            }
        }
    };

    const handleClose = () => {
        if (onCancel) {
            setError(false);
            setReason("")
            onCancel();
        }
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
            <DialogTitle id="confirm-dialog-title">{`Please provide a reason for modification`}</DialogTitle>
            <DialogContent>
            <DialogContentText id="confirm-dialog-description">
                <TextField 
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                    id="modification-reason" 
                    label={
                        <>
                          Modification Reason<span style={{ color: "red" }}>*</span>
                        </>
                    }
                    error={error}
                    helperText={error ? "Please specify modification reason": ""} 
                    variant="filled" />
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>{`Cancel`}</Button>
            <Button
                color="primary"
                variant="contained"
                onClick={handleConfirm}
                autoFocus
            >
                {`Update`}
            </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
};

export default ConfirmDialogWithReason;
