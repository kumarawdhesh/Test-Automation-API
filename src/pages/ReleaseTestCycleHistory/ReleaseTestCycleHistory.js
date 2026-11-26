import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Divider, Grid, IconButton, Paper, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useDeleteReleaseMutation, useDeleteTestCycleMutation, useGetReleaseTestCyclesMutation, useGetTestCyclesByReleaseIdMutation } from "../../store/mdtSlice";
import { closeLoading, openDialog, showLoading, showSnackbar } from "../../store/appSlice";
import { setReleaseAndCyclesData, setSelectedReleaseId } from "../../store/dataSlice";
import CreateReleaseTestCycleDialog from "../../components/CreateReleaseTestCycleDialog/CreateReleaseTestCycleDialog";
import * as classes from "./ReleaseTestCycleHistory.module.css";
import { checkUserAccess, consoleLog, showReadOnlySnackbar, sortDataInDecOrder } from "../../utils/utility";

const ReleaseTestCycleHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false);
  const { selectedOrgAppDetails } = useSelector((state) => state?.data);
  const [searchReleaseTestCycles, setSearchReleaseTestCycles] = useState("");
  const [testCycles, setTestCycles] = useState([]);
  const [selectedReleaseName, setSelectedReleaseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogType, setDialogType] = useState("release");
  const { getReleasesAndTestCyclesData } = useSelector((state) => state?.data);
  const [selectedReleaseIndex, setSelectedReleaseIndex] = useState(null);
  const { selectedTestcycleId } = useSelector((state) => state?.data);
  const { selectedReleaseId } = useSelector((state) => state?.data);

  const [getReleaseTestCycles] = useGetReleaseTestCyclesMutation();
  const [getTestCyclesByReleaseId] = useGetTestCyclesByReleaseIdMutation();
  const [deleteRelease] = useDeleteReleaseMutation();
  const [deleteTestCycle] = useDeleteTestCycleMutation();

  // const tabNames = ["Releases & Test Cycles", "Releases", "Test Cycles"];
  const tabNames = ["Releases", "Test Cycles"];

  const accessCheck = checkUserAccess();
  const [viewMode, setViewMode] = useState("all"); // "all" | "releases" | "testcycles"

  useEffect(() => {
    fetchReleaseTestCycles();
  }, []);

  useEffect(() => {
    if (selectedReleaseId) {
      const selectedItem = getReleasesAndTestCyclesData.releases.find((item) => item.release_id === selectedReleaseId);
      if (selectedItem) {
        handleItemClick(selectedItem, "release", selectedReleaseIndex);
      }
    }
  }, [selectedReleaseId]);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const fetchReleaseTestCycles = async () => {
    try {
      dispatch(showLoading());
      
      const { data: response, error } = await getReleaseTestCycles({
        function_name: "get-release-testcycles",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        user_id: sessionStorage.getItem("username"),
      });
      
      if (response && response.data && response.statusCode === 200) {
        dispatch(setReleaseAndCyclesData(response.data));
        setLoading(false);
        dispatch(closeLoading());
      }
      
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching release and test cycles:", error);
    } finally {
      dispatch(closeLoading());
    }
  };

  const handleDelete = async (item, type, event) => {
    event.stopPropagation();
    try {
      if (type.includes("release")) {
        const { data: response, error } = await deleteRelease({
          function_name: "release-delete",
          release_id: item.release_id,
          user_id: sessionStorage.getItem("username"),
        });

        if (response && response.statusCode === 200) {
          const updatedReleases = getReleasesAndTestCyclesData.releases.filter((release) => release.release_id !== item.release_id);

          dispatch(
            setReleaseAndCyclesData({
              releases: updatedReleases,
              test_cycles: getReleasesAndTestCyclesData.test_cycles.filter((testCycle) => testCycle.release_id !== item.release_id),
            })
          );
          setSelectedReleaseName("");
          dispatch(
            showSnackbar({
              message: response.message,
              className: "color-success-background width-50",
            })
          );
        }
      } else {
        const { data: response, error } = await deleteTestCycle({
          function_name: "test-cycle-delete",
          user_id: sessionStorage.getItem("username"),
          test_cycle_id: item.test_cycle_id,
        });
        if (response && response.statusCode === 200) {
          const updatedTestCycle = getReleasesAndTestCyclesData.test_cycles.filter((testCycle) => testCycle.test_cycle_id !== item.test_cycle_id);

          dispatch(
            setReleaseAndCyclesData({
              releases: getReleasesAndTestCyclesData.releases,
              test_cycles: updatedTestCycle,
            })
          );

          dispatch(
            showSnackbar({
              message: response.message,
              className: "color-success-background width-50",
            })
          );
        }
      }
    } catch (error) {
      console.error(`Error deleting ${type} :`, error);
      dispatch(
        showSnackbar({
          message: `Error deleting ${type}`,
          className: "color-error-background width-50",
        })
      );
    }
  };

  const handleDeleteConfirmation = (item, type, event) => {
    event.stopPropagation();
    if (accessCheck) {
      const confirmDialog = {
        open: true,
        titleText: "Delete Confirmation",
        innerText: `Are you sure you want to Delete ${type} ?`,
        buttonText: {
          cancel: "Cancel",
          confirm: "Confirm",
        },
        onConfirm: () => {
          console.log(`Confirmed delete for ${type}:`, item);
          handleDelete(item, type, event);
        },
        onCancel: () => {
          consoleLog("info", "dialog close");
        },
      };
      dispatch(openDialog(confirmDialog));
    } else {
      showReadOnlySnackbar(dispatch);
    }
  };

  const handleItemClick = (item, type, index) => {
    if (type.includes("release")) {
      fetchTestCyclesByReleaseId(item.release_id);
      setSelectedReleaseName(item.release_name);
      setSelectedReleaseIndex(index);
      dispatch(setSelectedReleaseId(item.release_id));
    } else {
      handlePathChange(item, type);
    }
  };

  const renderItems = (items, type) => {
    if (!items) return null;

    return items.map((item, index) => {
      const isSelected = type.includes("test cycle") ? selectedTestcycleId === item.test_cycle_id : type.includes("release") ? selectedReleaseId === item.release_id : selectedReleaseIndex === index;

      const Icon = type.includes("release") ? CalendarMonthIcon : AutorenewIcon;

      return (
        <Item
          key={index}
          onClick={() => handleItemClick(item, type, index)}
          sx={{
            "&:hover": { backgroundColor: "#eeecec !important" },
          }}
          className={`${classes.item} ${isSelected ? classes.selectedItem : ""}`}
        >
          <Typography className={classes.text} variant="subtitle2">
            <Icon className={classes.icon} />
            {item.release_name || item.test_cycle_name}
          </Typography>
          <Tooltip title="Delete" arrow>
            <IconButton className="color-icon" onClick={(event) => handleDeleteConfirmation(item, type, event)}>
              <DeleteIcon style={{ fontSize: "18px" }} />
            </IconButton>
          </Tooltip>
        </Item>
      );
    });
  };

  const filteredItems = (items) => items?.filter((item) => (item.release_name || item.test_cycle_name).toLowerCase().includes(searchReleaseTestCycles.toLowerCase()));

  const filteredReleases = filteredItems(getReleasesAndTestCyclesData?.releases);
  const filteredTestCycles = filteredItems(getReleasesAndTestCyclesData?.test_cycles);

  const fetchTestCyclesByReleaseId = async (releaseId) => {
    try {
      dispatch(showLoading());
      const payload = {
        function_name: "get-test-cycles",
        user_id: sessionStorage.getItem("username"),
        release_ids: [releaseId],
      };
      const { data: response, error } = await getTestCyclesByReleaseId(payload);
      if (response && response.body && response.statusCode === 200) {
        const sortedTestCycles = sortDataInDecOrder(response.body.test_cycles, "test_cycle_id");
        setTestCycles(sortedTestCycles);
        dispatch(closeLoading());
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching Test cycle:", error);
      dispatch(closeLoading());
    }
  };

  const handlePathChange = (testCycle, type) => {
    let testcyclename = testCycle.test_cycle_name;
    const replace = testcyclename.replaceAll(" ", "_");
    navigate(`/testcycle-details/${replace}`, {
      state: {
        testCycleData: testCycle,
        type: type,
      },
    });
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpen(true);
  };

  const noResultsForReleases = filteredReleases && filteredReleases.length === 0;
  const noResultsForTestCycles = filteredTestCycles && filteredTestCycles.length === 0;

  return (
    <Paper elevation={3} sx={{ p: 2, m: "20px 30px 60px 30px" }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        {/* View Mode Buttons */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            variant={viewMode === "all" ? "contained" : "outlined"}
            onClick={() => setViewMode("all")}
          >
            Releases
          </Button>
          <Button
            variant={viewMode === "testcycles" ? "contained" : "outlined"}
            onClick={() => setViewMode("testcycles")}
          >
            Test Cycles
          </Button>
        </Box>

        {/* Header Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search Releases/Test Cycles"
            InputProps={{ endAdornment: <SearchIcon /> }}
            value={searchReleaseTestCycles}
            onChange={(e) => setSearchReleaseTestCycles(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" size="small" onClick={() => handleOpenDialog("release")}>
              Add New Release +
            </Button>
            <Button variant="contained" size="small" onClick={() => handleOpenDialog("testCycle")}>
              Add Test Cycle +
            </Button>
          </Box>
          
        </Box>
      </Box>

      {/* Main Panels */}
      <Box sx={{
        display: "flex",
        gap: 3,
        flexDirection: { xs: "column", md: "row" },
        minHeight: "calc(100vh - 330px)"
      }}>
        {(viewMode === "all" || viewMode === "releases") && (
          <Box sx={{
            flex: 1,
            background: "#f9f9f9",
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
            minHeight: 300,
            boxShadow: 1
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Releases</Typography>
            {filteredReleases?.length === 0 ? (
              <Typography>No releases found.</Typography>
            ) : (
              filteredReleases?.map((item, idx) => (
                <Box
                  key={item.release_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    background: selectedReleaseId === item.release_id ? "#e2f5d9" : "#fff",
                    boxShadow: selectedReleaseId === item.release_id ? 2 : 0,
                    cursor: "pointer",
                    "&:hover": { background: "#eeecec" }
                  }}
                  onClick={() => handleItemClick(item, "release", idx)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                    <Typography variant="subtitle2" noWrap>{item.release_name}</Typography>
                  </Box>
                  <Tooltip title="Delete" arrow>
                    <IconButton size="small" onClick={(e) => handleDeleteConfirmation(item, "release", e)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))
            )}
          </Box>
        )}

        {(viewMode === "all" || viewMode === "testcycles") && (
          <Box sx={{
            flex: 1,
            background: "#f9f9f9",
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
            minHeight: 300,
            boxShadow: 1
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {viewMode === "testcycles"
                ? "All Test Cycles"
                : selectedReleaseName
                  ? `Test Cycles for "${selectedReleaseName}"`
                  : "Test Cycles"}
            </Typography>
            {viewMode === "testcycles"
              ? (
                filteredTestCycles.length === 0
                  ? <Typography>No test cycles found.</Typography>
                  : filteredTestCycles.map((testCycle, idx) => (
                    <Box
                      key={testCycle.test_cycle_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        background: selectedTestcycleId === testCycle.test_cycle_id ? "#e2f5d9" : "#fff",
                        boxShadow: selectedTestcycleId === testCycle.test_cycle_id ? 2 : 0,
                        cursor: "pointer",
                        "&:hover": { background: "#eeecec" }
                      }}
                      onClick={() => handlePathChange(testCycle, "test cycle")}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AutorenewIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                        <Typography variant="subtitle2" noWrap>{testCycle.test_cycle_name}</Typography>
                      </Box>
                      <Tooltip title="Delete" arrow>
                        <IconButton size="small" onClick={(e) => handleDeleteConfirmation(testCycle, "test cycle", e)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))
              )
              : (
                selectedReleaseId && testCycles.length === 0
                  ? <Typography>No test cycles found for this release.</Typography>
                  : selectedReleaseId && testCycles.map((testCycle, idx) => (
                    <Box
                      key={testCycle.test_cycle_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        background: selectedTestcycleId === testCycle.test_cycle_id ? "#e2f5d9" : "#fff",
                        boxShadow: selectedTestcycleId === testCycle.test_cycle_id ? 2 : 0,
                        cursor: "pointer",
                        "&:hover": { background: "#eeecec" }
                      }}
                      onClick={() => handlePathChange(testCycle, "test cycle")}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AutorenewIcon sx={{ fontSize: 18, color: "#0ea5e9" }} />
                        <Typography variant="subtitle2" noWrap>{testCycle.test_cycle_name}</Typography>
                      </Box>
                      <Tooltip title="Delete" arrow>
                        <IconButton size="small" onClick={(e) => handleDeleteConfirmation(testCycle, "test cycle", e)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))
              )
            }
            {viewMode !== "testcycles" && !selectedReleaseId && (
              <Typography>Select a release to view its test cycles.</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      <CreateReleaseTestCycleDialog open={open} setOpen={setOpen} type={dialogType} fetchReleaseTestCycles={fetchReleaseTestCycles} />
    </Paper>
  );
};

export default ReleaseTestCycleHistory;
