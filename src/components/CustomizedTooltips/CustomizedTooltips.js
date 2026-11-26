import * as React from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
export const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
    "&:before": {
      border: "1px solid #d6def3",
    },
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "#171717",
    border: "1px solid #d6def3",
    boxShadow: theme.shadows[1],
    fontSize: 12,
  },
}));

export const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
   // color: theme.palette.common.black,
   color:"#323232"
  },
  [`& .${tooltipClasses.tooltip}`]: {
   // backgroundColor: theme.palette.common.black,
    backgroundColor:"#323232"
  },
}));


export const DefaultTooltip = ({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
);
