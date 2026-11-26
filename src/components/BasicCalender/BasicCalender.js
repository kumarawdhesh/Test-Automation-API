import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
const BasicDateCalendar = ({ date, setDate, dateError, setDateError }) => {
  const [value, setValue] = useState();
  const handleDateChange = (val) => {
    setValue(val);
    setDate(dayjs(val).format("YYYY-MM-DD"));
    setDateError(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              helperText: dateError ? "Date is required" : "",
              error: dateError,
            },
          }}
          value={value}
          onChange={(newValue) => handleDateChange(newValue)}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};
export default BasicDateCalendar;
