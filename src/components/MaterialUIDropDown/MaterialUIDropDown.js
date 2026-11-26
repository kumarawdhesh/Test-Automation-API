import React from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const MaterialUIDropDown = ({
  label,
  value,
  handleChange,
  options = [],
  disabled,
}) => {
  return (
    <Select
      labelId="select-TS-label"
      id="select-TS"
      label={label}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 150,
            overflowY: "auto",
          },
        },
      }}
    >
      {options?.map((option) => {
        return (
          <MenuItem key={option.name} value={option.name}>
            {option.name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default MaterialUIDropDown;
