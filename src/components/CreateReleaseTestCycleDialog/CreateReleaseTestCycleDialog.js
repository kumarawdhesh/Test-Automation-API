import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Box,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetTestCaseListMutation,
  useGetTestCyclesListMutation,
  useGetAllReleasesMutation,
  useCreateNewTestCycleMutation,
  useCreateNewReleaseMutation,
  useGetTestSuitMutation,
} from "../../store/mdtSlice";
import { sortDataInDecOrder } from "../../utils/utility";
import { useDispatch, useSelector } from "react-redux";
import MultiselectDialog from "../MultiselectDialog/MultiselectDialog";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { Add, AddCircle } from "@mui/icons-material";
import AddDependenciesDialog from "../TestcaseDependency/AddDependenciesDialog";

const CreateReleaseTestCycleDialog = ({
  open,
  setOpen,
  type,
  fetchReleaseTestCycles,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    plannedStartDate: "",
    selectedTestCycle: [],
    selectedRelease: "",
    selectedTestCases: [],
  });
  const [selectedTestcasesWithDeps, setSeletedTestcasesWithDeps] = useState([]);

  const [errors, setErrors] = useState({
    name: "",
    plannedStartDate: "",
  });
  const [testCycles, setTestCycles] = useState([]);
  const [releases, setReleases] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const { selectedOrgAppDetails} = useSelector((state) => state.data);
  const { getReleasesAndTestCyclesData } = useSelector((state) => state?.data);
  const [multiSelectDialogOpen, setMultiSelectDialogOpen] = useState(false);
  const [masterTestSuites, setMasterTestSuites] = useState([]);
  const [addDepsOpen, setAddDepsOpen] = useState(false);

  const [getTestCyclesList] = useGetTestCyclesListMutation();
  const [createNewRelease] = useCreateNewReleaseMutation();
  const [createNewTestCycle] = useCreateNewTestCycleMutation();
  const [getAllReleases] = useGetAllReleasesMutation();
  const [getTestCaseList] = useGetTestCaseListMutation();
  // const [getTestSuit] = useGetTestSuitMutation();

  const fetchTestCycles = async () => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getTestCyclesList({
        function_name: "list-test-cycles",
        user_id: sessionStorage.getItem("username"),
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
      });
      if (response && response.body && response.statusCode === 200) {
        const sortedDataByTestCycleId = sortDataInDecOrder(
          response.body.test_cycles,
          "test_cycle_id"
        );
        setTestCycles(sortedDataByTestCycleId);
        dispatch(closeLoading());
      }
      if (error) throw error;
    } catch (error) {
      console.error("Failed to fetch test cycles:", error);
    }
  };

  const fetchAllReleases = async () => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getAllReleases({
        function_name: "list-releases",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        user_id: sessionStorage.getItem("username"),
      });
      if (response && response.data && response.statusCode === 200) {
        const sortedReleases = sortDataInDecOrder(response.data.releases, "release_id");
        setReleases(sortedReleases);
        dispatch(closeLoading());
      }
      if (error) throw error;
    } catch (error) {
      console.error("Failed to fetch releases:", error);
    }
  };

  const fetchTestCases = async () => {
    try {
      dispatch(showLoading());
      const { data: response, error } = await getTestCaseList({
        function_name: "list-test-cases",
        domain_name: selectedOrgAppDetails.orgName,
        user_id: sessionStorage.getItem("username"),
        sub_domain_name: selectedOrgAppDetails.appName,
      });
      if (response && response.body && response.statusCode === 200) {
        const sortedTestCases = sortDataInDecOrder(
          response.body.test_cases,
          "test_case_id"
        );
        setTestCases(sortedTestCases);
        dispatch(closeLoading());
      }
      if (error) throw error;
    } catch (error) {
      console.error("Failed to fetch test cases:", error);
    }
  };

  const fetchAllSuitesAndCases = async () => {    
    try {
      const { data: response, error } = await getTestCaseList({ // Using exisiting Slice for fetching test suites as lambda grouping is done.
        function_name: "get-suite-cases",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        user_id: sessionStorage.getItem("username"),
      });
      if (response && response.body && response.statusCode === 200) {

        // const sortedTestSuites = sortDataInDecOrder(response.body.test_suites, "id");
        setMasterTestSuites(response.body.data);
        // setTotalSuitesCount(response.body.overll_test_suite_count);
        
      }
      if (!!error) throw error;
	  } catch (error) {
		  console.error("Failed to fetch test suites and cases: ", error);
	  }
  };

  useEffect(() => {
    if (open && type === "release") {
      fetchTestCycles();
    }
    if (open && type === "testCycle") {
      fetchAllReleases();
      fetchAllSuitesAndCases();
      fetchTestCases();
    }
  }, [open, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.plannedStartDate)
      newErrors.plannedStartDate = "Planned start date is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
    } else {
      dispatch(showLoading());
      if (type === "release") {
        try {
          const existingRelease = getReleasesAndTestCyclesData.releases.find(
            (release) => release.release_name === formData.name
          );
          if (existingRelease) {
            dispatch(
              showSnackbar({
                message: "Release with this name already exists.",
                className: "color-error-background width-50",
              })
            );
            dispatch(closeLoading());
            return;
          }
          const { data: response, error } = await createNewRelease({
            function_name: "release-create",
            domain_name: selectedOrgAppDetails.orgName,
            sub_domain_name: selectedOrgAppDetails.appName,
            user_id: sessionStorage.getItem("username"),
            release_name: formData.name,
            release_desc: formData.description,
            release_date: formData.plannedStartDate,
            test_cycle_ids: formData.selectedTestCycle,
          });
          if (response && response.message && response.statusCode === 200) {
            dispatch(
              showSnackbar({
                message: response.message,
                className: "color-success-background width-50",
              })
            );
            handleClose();
            fetchReleaseTestCycles();
          } else {
            dispatch(
              showSnackbar({
                message: response.message,
                className: "color-error-background width-50",
              })
            );
          }
          dispatch(closeLoading());
          if (error) throw error;
        } catch (error) {
          console.error("Error while creating release:", error);
          dispatch(closeLoading());
        }
      } else {
        try {
          const existingRelease = getReleasesAndTestCyclesData.test_cycles.find(
            (testcycle) => testcycle.test_cycle_name === formData.name
          );
          if (existingRelease) {
            dispatch(
              showSnackbar({
                message: "Testcycle with this name already exists.",
                className: "color-error-background width-50",
              })
            );
            dispatch(closeLoading());
            return;
          }
          const { data: response, error } = await createNewTestCycle({
            function_name: "test-cycle-create",
            user_id: sessionStorage.getItem("username"),
            domain_name: selectedOrgAppDetails.orgName,
            sub_domain_name: selectedOrgAppDetails.appName,
            test_cycle_name: formData.name,
            test_cycle_desc: formData.description,
            release_date: formData.plannedStartDate,
            // test_case_ids: formData.selectedTestCases,
            test_cases: selectedTestcasesWithDeps.length > 0 
              ? selectedTestcasesWithDeps 
              : formData.selectedTestCases,
            release_ids: formData.selectedRelease ? [formData.selectedRelease] : [],
          });
          if (response && response.message && response.statusCode === 200) {
            dispatch(
              showSnackbar({
                message: response.message,
                className: "color-success-background width-50",
              })
            );
            handleClose();
            fetchReleaseTestCycles();
          } else {
            dispatch(
              showSnackbar({
                message: response.message,
                className: "color-error-background width-50",
              })
            );
          }
          dispatch(closeLoading());
          if (error) throw error;
        } catch (error) {
          console.error("Error while creating test cycle:", error);
          dispatch(closeLoading());
        }
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      description: "",
      plannedStartDate: "",
      selectedTestCycle: [],
      selectedRelease: "",
      selectedTestCases: [],
    });
    setErrors({
      name: "",
      plannedStartDate: "",
    });
  };

  const getDialogTitle = () =>
    type === "release" ? "Create New Release" : "Create New Test Cycle";

  const handleUpdateSelectedIds = (selectedIds) => {
    if (type === "release") {
      setFormData((prevData) => ({
        ...prevData,
        selectedTestCycle: selectedIds,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        selectedTestCases: selectedIds,
      }));
    }
  };

  const handleMultiSelectDialogOpen = () => {
    setMultiSelectDialogOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        "& .MuiDialog-paper": {
          overflowX: "hidden",
          maxWidth: "400px",
          width: "80%",
        },
      }}
    >
      <DialogTitle>
        {getDialogTitle()}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              variant="standard"
              label={
                <div>
                  Name <span style={{ color: "red" }}>*</span>
                </div>
              }
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              sx={{
                "& .MuiFormLabel-root": { color: "rgba(0, 0, 0, 0.6) !important" },
              }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              variant="standard"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          <Box mb={2}>
            <TextField
              variant="standard"
              label={
                <div>
                  Planned Start Date <span style={{ color: "red" }}>*</span>
                </div>
              }
              name="plannedStartDate"
              value={formData.plannedStartDate}
              onChange={handleChange}
              fullWidth
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.plannedStartDate}
              helperText={errors.plannedStartDate}
              sx={{
                "& .MuiFormLabel-root": { color: "rgba(0, 0, 0, 0.6) !important" },
              }}
            />
          </Box>
          {type === "release" && (
            <Box mb={2}>
              <FormControl fullWidth variant="standard">
                <InputLabel id="select-test-cycle-label">Select Test Cycle</InputLabel>
                <Select
                  labelId="select-test-cycle-label"
                  id="select-test-cycle"
                  multiple
                  value={formData.selectedTestCycle}
                  readOnly
                  onClick={handleMultiSelectDialogOpen}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.length <= 3 ? (
                        selected.map((cycleId) => {
                          const cycle = testCycles.find(
                            (cycle) => cycle.test_cycle_id === cycleId
                          );
                          return (
                            <Chip
                              key={cycleId}
                              label={cycle?.test_cycle_name}
                              sx={{
                                height: 20,
                                fontSize: "0.75rem",
                                "& .MuiChip-label": {
                                  paddingLeft: 0.5,
                                  paddingRight: 0.5,
                                },
                              }}
                            />
                          );
                        })
                      ) : (
                        <>
                          {selected.slice(0, 3).map((cycleId) => {
                            const cycle = testCycles.find(
                              (cycle) => cycle.test_cycle_id === cycleId
                            );
                            return (
                              <Chip
                                key={cycleId}
                                label={cycle?.test_cycle_name}
                                sx={{
                                  height: 20,
                                  fontSize: "0.75rem",
                                  "& .MuiChip-label": {
                                    paddingLeft: 0.5,
                                    paddingRight: 0.5,
                                  },
                                }}
                              />
                            );
                          })}
                          <span style={{ fontSize: "12px" }}>
                            {" "}
                            {`+${selected.length - 3} more`}
                          </span>
                        </>
                      )}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        display: "none",
                      },
                    },
                  }}
                >
                  {testCycles.map((cycle) => (
                    <MenuItem key={cycle.test_cycle_id} value={cycle.test_cycle_id}>
                      {cycle.test_cycle_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          {type === "testCycle" && (
            <>
              <Box mb={2}>
                <FormControl fullWidth variant="standard">
                  <InputLabel>Select Release</InputLabel>
                  <Select
                    label="Select Release"
                    name="selectedRelease"
                    value={formData.selectedRelease}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        selectedRelease: e.target.value,
                      }))
                    }
                    fullWidth
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 150,
                          overflowY: "auto",
                        },
                      },
                    }}
                  >
                    {releases.map((release) => (
                      <MenuItem key={release.release_id} value={release.release_id}>
                        {release.release_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box mb={2}>
                <FormControl fullWidth variant="standard">
                  <InputLabel id="select-test-case-label">Select Test Case</InputLabel>
                  <Select
                    labelId="select-test-case-label"
                    id="select-test-case"
                    multiple
                    value={formData.selectedTestCases}
                    readOnly
                    onClick={handleMultiSelectDialogOpen}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.length <= 3 ? (
                          selected.map((caseId) => {
                            const testCase = testCases.find(
                              (tc) => tc.test_case_id === caseId
                            );
                            return (
                              <Chip
                                key={caseId}
                                label={testCase?.test_case_name}
                                sx={{
                                  height: 20,
                                  fontSize: "0.75rem",
                                  "& .MuiChip-label": {
                                    paddingLeft: 0.5,
                                    paddingRight: 0.5,
                                  },
                                }}
                              />
                            );
                          })
                        ) : (
                          <>
                            {selected.slice(0, 3).map((caseId) => {
                              const testCase = testCases.find(
                                (tc) => tc.test_case_id === caseId
                              );
                              return (
                                <Chip
                                  key={caseId}
                                  label={testCase?.test_case_name}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.75rem",
                                    "& .MuiChip-label": {
                                      paddingLeft: 0.5,
                                      paddingRight: 0.5,
                                    },
                                  }}
                                />
                              );
                            })}
                            <span style={{ fontSize: "12px" }}>
                              {" "}
                              {`+${selected.length - 3} more`}
                            </span>
                          </>
                        )}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          display: "none",
                        },
                      },
                    }}
                  />
                </FormControl>
              </Box>
              <Button
                sx={{ float: "right" }}
                variant="outlined"
                size="small"
                startIcon={<AddCircle />}
                disabled={formData.selectedTestCases.length === 0}
                onClick={() => {setAddDepsOpen(true);}}
              >
                Add Dependencies
              </Button>
            </>
          )}
          <DialogActions sx={{ marginTop: "50px" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
      <MultiselectDialog
        open={multiSelectDialogOpen}
        setOpen={setMultiSelectDialogOpen}
        // testCases={testCases}
        options={type === "release" ? testCycles : masterTestSuites}
        updateSelectedIds={handleUpdateSelectedIds}
        type={type === "release" ? "release" : "testcycle"}
        selectedIds={
          type === "release" ? formData.selectedTestCycle : formData.selectedTestCases
        }
      />
      <AddDependenciesDialog
        open={addDepsOpen}
        setOpen={setAddDepsOpen}
        testCases={testCases}
        selectedTestCases={formData.selectedTestCases}
        // selectedTestcasesWithDeps={selectedTestcasesWithDeps}
        setSeletedTestcasesWithDeps={setSeletedTestcasesWithDeps}
      />
    </Dialog>
  );
};

export default CreateReleaseTestCycleDialog;