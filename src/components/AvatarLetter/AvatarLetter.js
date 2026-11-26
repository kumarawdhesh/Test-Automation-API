import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import { BootstrapTooltip, LightTooltip } from '../CustomizedTooltips/CustomizedTooltips';
import { cleanString } from '../../utils/utility';


function stringAvatar(name) {
  const cname = cleanString(name);
  
  if (!cname) {
    return {
      sx: {
        bgcolor: "#323232",
      },
      children: "??", // Default value if cname is empty or invalid
    };
  }

  const parts = cname.split(' ');
  const firstInitial = parts[0]?.[0] || "?";
  const secondInitial = parts[1]?.[0] || "?";

  return {
    sx: {
      bgcolor: "#323232",
    },
    children: `${firstInitial}${secondInitial}`,
  };
}

export default function AvatarLetter({fullName, config = {},displayToolTip,placement="bottom"}) {
  const styles = {height: 40, border:"1px solid white", ...config};
  return (
    <>
    {displayToolTip ? (
      <BootstrapTooltip title={fullName} placement="bottom">
      <Avatar style={styles} {...stringAvatar(fullName)} placement={placement} />
      </BootstrapTooltip>
    ) : (
      <Avatar style={styles} {...stringAvatar(fullName)} /> 
    )}
    </>
  )
}