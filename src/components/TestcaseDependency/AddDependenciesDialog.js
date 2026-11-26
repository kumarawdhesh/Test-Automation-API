import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const AddDependenciesDialog = ({ open, setOpen, selectedTestCases, testCases, setSeletedTestcasesWithDeps}) => {
  const [dependencies, setDependencies] = useState({}); // { testCaseId: [depIds] }

  // Initialize dependencies state when the dialog opens or selectedTestCases change
  React.useEffect(() => {
    const initialDependencies = {};
    selectedTestCases.forEach(tc => {
      if (tc.depends_on && tc.depends_on.length > 0) {
        initialDependencies[tc.test_case_id] = tc.depends_on;
      }
    });
    setDependencies(initialDependencies);
  }, [selectedTestCases, open]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTestCaseForDeps, setSelectedTestCaseForDeps] = useState(null);

  // Map test case IDs to names for quick lookup
  const testCaseMap = useMemo(() => {
    const map = {};
    testCases.forEach((tc) => {
     map[tc.test_case_id] = tc.test_case_name;
    });
    return map;
  }, [testCases]);

  // Check if adding depId as a dependency of testCaseId would create a cycle
  const wouldCreateCycle = (testCaseId, depId) => {
    const visited = new Set();
    
    const hasCycle = (currentId, targetId) => { // Renamed to avoid conflict with outer scope
      if (visited.has(currentId)) return false; // Already checked this branch
      visited.add(currentId);
      
      const deps = dependencies[currentId] || [];
      
      // If any direct dependency is the target, cycle detected
      if (deps.includes(targetId)) return true; // Check if the dependency itself is the target
      
      // Recursively check all dependencies of current dependencies
      for (const dep of deps) {
        if (hasCycle(dep, targetId)) return true;
      } // Recursive call
      
      return false;
    };
    
    // Check if depId already depends on testCaseId (direct or transitive)
    return hasCycle(depId, testCaseId);
  };

  // Get available dependencies for a test case (exclude self, already selected, cyclic)
  // Only considers testCases from selectedTestCases
  const getAvailableDependencies = (testCaseId) => {
    const currentDeps = dependencies[testCaseId] || [];

    return selectedTestCases
      .map((tc) => ({ test_case_id: tc.test_case_id, test_case_name: testCaseMap[tc.test_case_id] }))
      .filter((tc) => {
        // Exclude self
        if (tc.test_case_id === testCaseId) return false;
        
        // Exclude already selected dependencies
        if (currentDeps.includes(tc.test_case_id)) return false;

        // Exclude if adding this would create a cycle
        if (wouldCreateCycle(testCaseId, tc.test_case_id)) return false;
        
        return true;
      });
  };

  const handleAddDepsClick = (testCaseId, event) => {
    setSelectedTestCaseForDeps(testCaseId);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedTestCaseForDeps(null);
  };

  const handleDependencyToggle = (depId) => {
    setDependencies((prev) => {
      const current = prev[selectedTestCaseForDeps] || [];
      const updated = current.includes(depId)
        ? current.filter((id) => id !== depId)
        : [...current, depId];
      return {
        ...prev,
        [selectedTestCaseForDeps]: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const handleRemoveDependency = (testCaseId, depId) => {
    setDependencies((prev) => {
      const current = prev[testCaseId] || [];
      const updated = current.filter((id) => id !== depId);
      return {
        ...prev,
        [testCaseId]: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const handleSave = () => {
    let temp = [];
    const processedTcIds = new Set();
    for (const [tcId, deps] of Object.entries(dependencies)) {
      temp.push({ test_case_id: parseInt(tcId), depends_on: deps });
      processedTcIds.add(parseInt(tcId));

    }

    // Add remaining test cases from selectedTestCases that are not in dependencies
    for (const tc of selectedTestCases) {
      if (!processedTcIds.has(tc.test_case_id)) {
        temp.push({ test_case_id: tc.test_case_id, depends_on: tc.depends_on || [] });
      }
    }
    setSeletedTestcasesWithDeps(temp);
    
    setOpen(false);
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Add Test Case Dependencies</DialogTitle>
      <DialogContent dividers>
        {selectedTestCases.length === 0 ? (
          <Alert severity="info">No test cases selected</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Test Case ID</TableCell>
                  <TableCell>Test Case Name</TableCell>
                  <TableCell>Dependencies</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedTestCases.map((tc) => {
                  const tcName = testCaseMap[tc.test_case_id] || "Unknown";
                  const deps = dependencies[tc.test_case_id] || [];
                  const depsDisplay = deps
                    .map((depId) => `${depId} (${testCaseMap[depId]})`)
                    .join(", ");

                  return (
                    <TableRow key={tc.test_case_id} hover>
                      <TableCell>{tc.test_case_id}</TableCell>
                      <TableCell>{tcName}</TableCell>
                      <TableCell>
                        {depsDisplay ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {deps.map((depId) => (
                              <Box
                                key={depId}
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                sx={{
                                  backgroundColor: "#e3f2fd",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography variant="caption">
                                  {depId}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveDependency(tc.test_case_id, depId)}
                                  sx={{ p: 0 }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleAddDepsClick(tc.test_case_id, e)}
                          color="primary"
                        >
                          <Add />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      {/* Popover for selecting dependencies */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "bold" }}>
            Select Dependencies for{" "}
            {selectedTestCaseForDeps &&
              `${selectedTestCaseForDeps} (${testCaseMap[selectedTestCaseForDeps]})`}
          </Typography>
          <FormGroup>
            {getAvailableDependencies(selectedTestCaseForDeps).length > 0 ? (
              getAvailableDependencies(selectedTestCaseForDeps).map((tc) => (
                <FormControlLabel
                  key={tc.test_case_id}
                  control={
                    <Checkbox
                      checked={(dependencies[selectedTestCaseForDeps] || []).includes(
                        tc.test_case_id
                      )}
                      onChange={() => handleDependencyToggle(tc.test_case_id)}
                    />
                  }
                  label={`${tc.test_case_id} - ${tc.test_case_name}`}
                />
              ))
            ) : (
              <Typography variant="caption" color="textSecondary">
                No available dependencies
              </Typography>
            )}
          </FormGroup>
          <Button
            size="small"
            variant="contained"
            onClick={handlePopoverClose}
            sx={{ mt: 2 }}
            fullWidth
          >
            Done
          </Button>
        </Box>
      </Popover>

      <DialogActions>
        <Button size="small" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button size="small" variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDependenciesDialog;