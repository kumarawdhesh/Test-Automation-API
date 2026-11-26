import React from 'react';
import { CircularProgress, Backdrop } from '@mui/material';
import Grid from "@mui/material/Grid";
import Stack from '@mui/material/Stack';




const LoaderView = ({ open }) => {
  return (
    <Grid container
  direction="row"
  justifyContent="center"
  height="500px"
  alignItems="center" ><Stack sx={{ color: 'grey.500' }} spacing={2} direction="row"><CircularProgress  color="success"/></Stack></Grid>
  );
};

export default LoaderView;
