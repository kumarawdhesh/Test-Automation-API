import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Switch, IconButton, Grid, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSchedulerOperationsMutation } from "../../store/mdtSlice";
import { useDispatch, useSelector } from "react-redux";
import { closeLoading, showLoading, showSnackbar, openDialog } from "../../store/appSlice";
import { getFormattedTime } from "../../utils/utility";
import SchedulerModal from "../TestCycle&Cases/SchedulerModal";

const Schedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [showSchedulerModal, setShowSchedulerModal] = useState(false);

    const { selectedOrgAppDetails } = useSelector((state) => state.data);

    const dispatch = useDispatch();
    const [schedulerOperation] = useSchedulerOperationsMutation();

    useEffect(() => {
        fetchSchedules();
    }, []);

    useEffect(() => {
        if(!showSchedulerModal){
            setCurrentSchedule(null);
        }
    }, [showSchedulerModal]);

    const fetchSchedules = async () => {
        try {
            dispatch(showLoading())
            const response = await schedulerOperation({
                function_name: "get_schedule_details",
                domain_name: selectedOrgAppDetails.orgName,
                sub_domain_name: selectedOrgAppDetails.appName,
                user_id: sessionStorage.getItem("username"),    
            });
            if (response.data && response.data.statusCode === 200) {
                setSchedules(response.data.body);
            }
            dispatch(closeLoading());
            
        } catch (error) {
            dispatch(
                showSnackbar({
                message: error,
                className: "color-error-background width-50",
                })
            );
            dispatch(closeLoading());
            console.error("Error fetching schedules:", error);
        }
    }

    const handleToggle = (id) => {
        setSchedules((prev) =>
            prev.map((schedule) =>
                schedule.id === id ? { ...schedule, status: !schedule.status } : schedule
            )
        );
    };

    const handleEdit = (schedule) => {        
        setShowSchedulerModal(true);
        setCurrentSchedule(schedule);
    };

    const updatedSchedule = async (schedule) => {
        dispatch(showLoading());
        let payload = {
            function_name: "scheduler",
            user_id: sessionStorage.getItem("username"),
        };
        if(schedule.scheduleType === "one-time") {
            payload = {
                ...payload,
                schedule_details: {
                    action: "UPDATE",        
                    schedule_name: schedule.scheduleName,
                    enabled: schedule.isEnabled,
                    schedule_type: "ONE_TIME",
                    date_time: schedule.startDateAndTime,
                }
            }
          } else if(schedule.scheduleType === "day") {
            
            payload = {
                ...payload,
                schedule_details: {
                    action: "UPDATE",        
                    schedule_name: schedule.scheduleName,
                    enabled: schedule.isEnabled,
                    schedule_type: "RECURRING",
                    end_date: schedule.endDate,
                    start_date: schedule.startDateAndTime,
                    frequency: "every_x_days",
                    hour: new Date(schedule.startDateAndTime).getHours(),
                    minute: new Date(schedule.startDateAndTime).getMinutes(),
                    interval: schedule.recur ? schedule.recurrenceValue : 1,
                },
            }
          } else if(schedule.scheduleType === "week") {
            payload = {
                ...payload,
                schedule_details: {
                    action: "UPDATE",        
                    schedule_name: schedule.scheduleName,
                    enabled: schedule.isEnabled,
                    schedule_type: "RECURRING",
                    end_date: schedule.endDate,
                    start_date: schedule.startDateAndTime,
                    frequency: "weekly",
                    hour: new Date(schedule.startDateAndTime).getHours(),
                    minute: new Date(schedule.startDateAndTime).getMinutes(),
                    days_of_week: schedule.selectedDays,
                },
            }
          } else if(schedule.scheduleType === "month") {
            payload = {
                ...payload,
                schedule_details: {
                    action: "UPDATE",        
                    schedule_name: schedule.scheduleName,
                    enabled: schedule.isEnabled,
                    schedule_type: "RECURRING",
                    end_date: schedule.endDate,
                    start_date: schedule.startDateAndTime,
                    frequency: "monthly",
                    hour: new Date(schedule.startDateAndTime).getHours(),
                    minute: new Date(schedule.startDateAndTime).getMinutes(),
                    day_of_month: schedule.recurrenceValue
                },
            }
          }
  
            let {data, error} = await schedulerOperation(payload);
            if (data && data.statusCode === 200) {
                dispatch(
                    showSnackbar({
                        message: data.message ? data.message : data.body,
                        className: "color-success-background width-50",
                    })
                );
                dispatch(closeLoading());
                setShowSchedulerModal(false);
            } else {
                dispatch(
                    showSnackbar({
                        message: data.message ? data.message : data.error,
                        className: "color-error-background width-50",
                    })
                );
                dispatch(closeLoading());
                console.error("Error executing test cases:", error);
            }
    }

    const handleDeleteConfirmation = (schedule) => {
        const confirmDialog = {
            open: true,
            titleText: "Delete Confirmation",
            innerText: `Are you sure you want to delete the schedule "${schedule.schedule_name}"?`,
            buttonText: {
                cancel: "Cancel",
                confirm: "Delete",
            },
            onConfirm: () => {
                handleDelete(schedule);
            },
            onCancel: () => {
                console.log("Delete cancelled");
            },
        };
        dispatch(openDialog(confirmDialog));
    };

    const handleDelete = async (schedule) => {
        dispatch(showLoading());
        let payload = {
            function_name: "scheduler",
            user_id: sessionStorage.getItem("username"),
            schedule_details: {
                action: "DELETE",
                schedule_name: schedule.schedule_name,
            }
        }
        const {data, error} = await schedulerOperation(payload);

        if (data && data.statusCode === 200) {
            dispatch(
                showSnackbar({
                    message: data.message ? data.message : data.body,
                    className: "color-success-background width-50",
                })
            );
            dispatch(closeLoading());
            setSchedules(schedules.filter((sch) => sch.schedule_name !== schedule.schedule_name));
        } else {
            dispatch(
                showSnackbar({
                    message: data.message ? data.message : data.error,
                    className: "color-error-background width-50",
                })
            );
            dispatch(closeLoading());
            console.error("Error deleting schedule:", error);
        }

    };

    const columns = [
        { field: "test_cycle_id", headerName: "Test Cycle ID", flex: 1},
        { field: "test_cycle_name", headerName: "Test Cycle Name", flex: 2},
        { field: "schedule_name", headerName: "Schedule Name", flex: 2},
        // { field: "modified_by", headerName: "Last Modified By", flex: 1},
        { 
            field: "frequency", 
            headerName: "Schedule Frequency", 
            flex: 2,
            renderCell: (params) => {
                const frequency = params.row.frequency;
                if (params.row.schedule_type === "ONE_TIME") {
                    return <>One Time</>;

                } else if (frequency === "every_x_days") {
                    if (params.row.schedule_interval === "1") {
                        return <>{`Every Day`}</>;
                    } else {
                        return <>{`Every ${params.row.schedule_interval} Days`}</>;
                    }

                } else if (frequency === "weekly") {
                    return <>Weekly</>;

                } else if (frequency === "monthly") {
                    return <>Monthly</>;

                } else {
                    return <></>;

                }
            }
        },
        { 
            field: "next_trigger", 
            headerName: "Next Trigger", 
            flex: 2, 
            renderCell: (params) => (
                <>{params.row.next_trigger === "expired" ? "Expired" : getFormattedTime(params.row.next_trigger)}</>
            )},
        {
            field: "enabled",
            headerName: "Enabled",
            renderCell: (params) => (
                // <Switch
                //     checked={params.row.enabled}
                //     onChange={() => handleToggle(params.row.id)}
                // />
                <>{params.row.enabled ? "Enabled" : "Disabled"}</>
            ),
            flex: 1
        },
        {
            field: "status",
            headerName: "Status",
            renderCell: (params) => (
                // <Switch
                //     checked={params.row.enabled}
                //     onChange={() => handleToggle(params.row.id)}
                // />
                <>{params.row.schedule_status}</>
            ),
            flex: 1
        },
        {
            field: "actions",
            headerName: "Actions",
            renderCell: (params) => (
                <>
                    <IconButton 
                        disabled={params.row.schedule_type === "ONE_TIME" && params.row.next_trigger === "expired"}
                        onClick={() => handleEdit(params.row)} 
                        color="secondary" >
                        <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton
                        onClick={() => handleDeleteConfirmation(params.row)}
                        color="secondary"
                    >
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </>
            ),
            flex: 2
        },
    ];

    return (
        <>
            <SchedulerModal 
                testCycleName={currentSchedule?.test_cycle_name}
                currentSchedule={currentSchedule}
                onSubmit={(data) =>{ updatedSchedule(data); }}
                open={showSchedulerModal}
                setOpen={(val) => {
                    setShowSchedulerModal(val);
                    if(!val){
                        setCurrentSchedule(null);
                    }
                }}

            />
            <Paper
                elevation={0}
                style={{
                    margin: "20px 15px 60px 15px",
                }}>
                <DataGrid
                    rows={schedules}
                    autoHeight
                    columns={columns}
                    getRowId={(row) => row.schedule_name}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    sx={{ width: "100%" }} // Add width here
                />
            </Paper>
        </>
    );
};

export default Schedule;