import React from 'react';
import { styled } from "@mui/material/styles";

const StyledDrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  minHeight: "54px !important",
  height: "54px !important",
  justifyContent: "flex-start",
}));

const DrawerHeader =() => {
  return <StyledDrawerHeader />;
}

export default DrawerHeader;
