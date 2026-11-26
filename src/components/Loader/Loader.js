import React from 'react';
import { CircularProgress, Backdrop } from '@mui/material';
// import VideoOverlay from './VideoOverlay';

const Loader = ({ open }) => {
  return (
    <Backdrop open={open} style={{ zIndex: 9999, color: '#fff' }}>
      <CircularProgress color="inherit" />
      {/* <VideoOverlay /> */}
    </Backdrop>
  );
};

export default Loader;
