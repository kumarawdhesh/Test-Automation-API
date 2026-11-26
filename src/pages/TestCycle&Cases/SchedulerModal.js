import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    TextField,
    Typography,
    Modal,
    Switch,
    Grid,
    Divider,
    Select,
    MenuItem,
    Avatar,
  } from "@mui/material";
  import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../store/appSlice";
  
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };
  
  const SchedulerModal = ({ testCycleName, onSubmit, open, setOpen, currentSchedule }) => {
    const [scheduleType, setScheduleType] = useState("one-time");
    const [scheduleName, setScheduleName] = useState("");
    const [recur, setRecur] = useState(false);
    const [recurrenceValue, setRecurrenceValue] = useState(2);
    const [selectedDays, setSelectedDays] = useState([]);
    const [startDateAndTime, setStartDateAndTime] = useState("");
    const [isEnabled, setIsEnabled] = useState(true);
    const [endDate, setEndDate] = useState("");

    const dispatch = useDispatch();

    useEffect(() => {
      if (currentSchedule) {
        setScheduleName(currentSchedule.schedule_name);
        
        // When the start_date is coming from DB it is in UTC format, As the start field can take only date & time we will remove seconds
        const startDate = currentSchedule.start_date.split("").slice(0, 16).join("");
        setStartDateAndTime(startDate);
        if (currentSchedule.schedule_type !== "ONE_TIME") {
          setEndDate(currentSchedule.end_date.split("T")[0]);
          setScheduleType("one-time");
        }
        if (currentSchedule.frequency === "every_x_days") {
          setScheduleType("day");
          if(currentSchedule.schedule_interval > 1){
            setRecur(true);
            setRecurrenceValue(currentSchedule.schedule_interval);
          }
        }
        if (currentSchedule.frequency === "weekly") {
          setScheduleType("week");
          setSelectedDays(currentSchedule.days_of_week || []);
        }
        if (currentSchedule.frequency === "monthly") {
          setScheduleType("month");
          setRecurrenceValue(currentSchedule.day_of_month);
        }
        setIsEnabled(currentSchedule.enabled);
      }
    }, [currentSchedule])
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!scheduleName.trim()) {
        dispatch(
          showSnackbar({
            message: "Schedule Name is required.",
            className: "color-error-background width-50",
          })
        );
        return;
      }

      if (!startDateAndTime) {
        dispatch(
          showSnackbar({
            message: "Start Date & Time is required.",
            className: "color-error-background width-50",
          })
        );
        return;
      }

      if (scheduleType !== "one-time" && !endDate) {
        dispatch(
          showSnackbar({
            message: "End Date is required for recurring schedules.",
            className: "color-error-background width-50",
          })
        );
        return;
      }

      if (scheduleType === "week" && selectedDays.length === 0) {
        dispatch(
          showSnackbar({
            message: "Please select at least one day for weekly schedule.",
            className: "color-error-background width-50",
          })
        );
        return;
      }

      if (scheduleType === "day" && recur && !recurrenceValue) {
        dispatch(
          showSnackbar({
            message: "Recurrence value is required for daily schedule.",
            className: "color-error-background width-50",
          })
        );
        return;
      }

      if (scheduleType === "month" && !recurrenceValue) {
        dispatch(
          showSnackbar({
            message: "Recurrence value is required for monthly schedule.",
            className: "color-error-background width-50",
          })
        );
        return;
      }

      const scheduleData = {
        scheduleName,
        testCycleName,
        scheduleType,
        startDateAndTime: `${startDateAndTime}:00`,
        endDate: scheduleType !== "one-time" ? `${endDate}T23:59:59` : undefined,
        recur: scheduleType === "day" ? recur : undefined,
        selectedDays: scheduleType === "week" ? selectedDays : undefined,
        isEnabled,
      };
      if(scheduleType === "day"){
        scheduleData.recurrenceValue = recur ? recurrenceValue : undefined;
      }
      if(scheduleType === "month"){
        scheduleData.recurrenceValue = recurrenceValue;
      }

      onSubmit(scheduleData);
    };
  
    const handleDaySelection = (day) => {
      setSelectedDays((prev) =>
        prev.includes(day.long) ? prev.filter((d) => d !== day.long) : [...prev, day.long]
      );
    };

    const resetFields = () => {
      setScheduleName("");
      setScheduleType("one-time");
      setRecur(false);
      setRecurrenceValue(2);
      setSelectedDays([]);
      setStartDateAndTime("");
      setIsEnabled(true);
      setEndDate("");
    }
  
    const handleClose = () => {
      setOpen(false);
      resetFields();
    };
  
    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            Schedule Test Cycle: <b>{testCycleName}</b>
          </Typography>
  
          <Divider sx={{ mb: 3 }} />

          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                label="Schedule Name"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                fullWidth
                required
                disabled={!!currentSchedule}
              />
            </Grid>
            <Grid item xs={12}>
                <TextField
                select
                value={scheduleType}
                label="Schedule Type"
                fullWidth
                onChange={(e) => setScheduleType(e.target.value)}
                >
                    <MenuItem value="one-time">One Time</MenuItem>
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={6}>
                <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={startDateAndTime}
                onChange={(e) => setStartDateAndTime(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            {scheduleType !== "one-time" && <Grid item xs={6}>
                <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>}
          </Grid>
  
          {/* Day Schedule Options */}
          {scheduleType === "day" && (
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recur}
                    onChange={() => setRecur(!recur)}
                  />
                }
                label="Frequency"
              />
              {recur && (
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Typography>Every</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      type="number"
                      value={recurrenceValue}
                      onChange={(e) => setRecurrenceValue(e.target.value)}
                      inputProps={{ min: 1 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <Typography>Day(s)</Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
  
          {/* Week Schedule Options */}
          {scheduleType === "week" && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Days
              </Typography>
              <Grid container spacing={1}>
                {[
                  { 
                    short: "S",
                    long: "SUN",
                  },
                  { 
                    short: "M",
                    long: "MON",
                  },
                  { 
                    short: "T",
                    long: "TUE",
                  },
                  { 
                    short: "W",
                    long: "WED",
                  },
                  { 
                    short: "T",
                    long: "THU",
                  },
                  { 
                    short: "F",
                    long: "FRI",
                  },
                  { 
                    short: "S",
                    long: "SAT",
                  },
                  
                ].map((day, index) => (
                  <Grid item key={index}>
                    <Avatar
                      sx={{
                        bgcolor: selectedDays.includes(day.long)
                          ? "primary.main"
                          : "grey.300",
                        color: selectedDays.includes(day.long) ? "white" : "black",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDaySelection(day)}
                    >
                      {day.short}
                    </Avatar>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* For Monthly Schedule capturing the day of the month */}
          {scheduleType === "month" && (
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend">Select Day of Month</FormLabel>
              <TextField
                type="number"
                value={recurrenceValue}
                onChange={(e) => setRecurrenceValue(e.target.value)}
                inputProps={{ min: 1, max: 31 }}
                fullWidth
                required
              />
            </Box>
          )}
  
          {/* Enable Schedule */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled}
                  onChange={() => setIsEnabled(!isEnabled)}
                />
              }
              label="Enable Schedule"
            />
          </Box>
  
          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              {currentSchedule ? 'Update Schedule' : 'Schedule'}
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };
  
  export default SchedulerModal;