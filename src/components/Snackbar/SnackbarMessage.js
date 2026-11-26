import React from 'react'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(
    props,
    ref,
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const SnackbarMessage = (props) => {

    const {handleClose, open, message, type} = props;

    return(
        <>
        <Snackbar
         anchorOrigin={{ vertical:'top', horizontal:'right' }}
         open={open} 
         autoHideDuration={6000} 
         onClose={handleClose}
         >
         <Alert 
         onClose={handleClose} 
         severity={type} 
         sx={{ width: '100%' }}
         >
          { message }
        </Alert>
        </Snackbar>
        </>
    )
}
export default SnackbarMessage