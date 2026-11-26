import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  Button,
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemIcon,
  ListItemButton,
  IconButton,
  TextField,
  Box,
  InputAdornment,
  Typography,
  Divider,
} from "@mui/material";
import { ExpandLess, ExpandMore, Search } from "@mui/icons-material";

const MultiselectDialog = ({
  open,
  setOpen,
  options,
  updateSelectedIds,
  type,
  selectedIds,
}) => {
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [expandedSuites, setExpandedSuites] = useState({});
  const [selectedTestCases, setSelectedTestCases] = useState([]);

  useEffect(() => {
    setSelectedTestCases(
      selectedIds.map((item) => (typeof item === "object" ? item.test_case_id : item))
    );
  }, [selectedIds]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options, type]);


  const handleToggleExpand = (suiteId) => {
    setExpandedSuites((prevState) => ({
      ...prevState,
      [suiteId]: !prevState[suiteId],
    }));
  };

  const handleSuiteSelect = (event, suiteId, testCasesInSuite) => {
    if(event.target.checked){  
      const allSelectedTestcaseIds = testCasesInSuite.every((id) => selectedTestCases.includes(id));
      if (allSelectedTestcaseIds) {
        setSelectedTestCases((prevSelected) =>
          prevSelected.filter((id) => !testCasesInSuite.includes(id))
        );
      } else {
        setSelectedTestCases((prevSelected) => [
          ...prevSelected,
          ...testCasesInSuite.filter((id) => !prevSelected.includes(id)).map((tc) => tc.test_case_id),
        ]);
      }
  
      setExpandedSuites((prevState) => ({
        ...prevState,
        [suiteId]: true,
      }));
    } else {
      const testCaseIds = testCasesInSuite.map((tc) => tc.test_case_id);
      setSelectedTestCases((prevSelected) =>
        prevSelected.filter((id) => !testCaseIds.includes(id))
      );
    }
  };
  
  const handleTestCaseSelect = (testCaseId) => {
    setSelectedTestCases((prevSelected) =>
      prevSelected.includes(testCaseId)
        ? prevSelected.filter((id) => id !== testCaseId)
        : [...prevSelected, testCaseId]
    );
  };

  const handleCheckBoxClick = (e) => {
    const caseId = Number(e.target.value);
    const id = caseId;
    const newSelectedIds = selectedTestCases.includes(id)
      ? selectedTestCases.filter((i) => i !== id)
      : [...selectedTestCases, id];
    setSelectedTestCases(newSelectedIds);
  };
  
  const handleSave = () => {

    const finalSelected = selectedIds.filter(item => selectedTestCases.includes(item.test_case_id))
      .concat(selectedTestCases.filter(id => !selectedIds.some(item => item.test_case_id === id))
      .map(id => ({ 
        test_case_id: id, 
        // test_case_name: options.flatMap(suite => suite.test_cases).find(tc => tc.test_case_id === id)?.test_case_name || "Unknown" 
      })));

    updateSelectedIds(finalSelected);

    setOpen(false);
  };

  const handleSearch = () => {
    if (search.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((item) =>
        type === "testcycle"
          ? (item.test_suite_name.toLowerCase().includes(search.toLowerCase()) 
              || item.test_suite_id.toString().includes(search.toLowerCase())
              || item.test_cases.some(tc => tc.test_case_name.toLowerCase().includes(search.toLowerCase())) 
              || item.test_cases.some(tc => tc.test_case_id.toString().includes(search.toLowerCase())))
          : item.test_cycle_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        "& .MuiDialog-paper": {
          overflowX: "hidden",
          maxWidth: "900px",
          width: "80%",
          height: "460px",
        },
      }}
    >
      <DialogTitle>
        {type === "release" ? "Select Test Cycle" : "Select Test Cases"}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "auto",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <Box mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            margin="dense"
          />
        </Box>
        {type === "testcycle" && (
          <>
            {/* header row for suite columns */}
            <Box display="flex" alignItems="center" px={1} mb={1}>
              <Typography variant="caption" sx={{ width: 90, fontWeight: 600, ml: 6 }}>
                Suite ID
              </Typography>
              <Typography variant="caption" sx={{ width: 200, fontWeight: 600, ml: 3 }}>
                Suite Name
              </Typography>
              <Typography variant="caption" sx={{ width: 140, fontWeight: 600, ml: 3, }}>
                Modified By
              </Typography>
            </Box>
            <Divider />
            <Box mt={1} />
           <List
             sx={{
               width: "100%",
               padding: 0,
               bgcolor: "background.paper",
             }}
             component="nav"
           >
             {filteredOptions.map((suite) => (
               <div key={suite.test_suite_id}>
                 <ListItemButton sx={{ padding: 0 }}>
                   <ListItemIcon>
                     <Checkbox
                       checked={suite?.test_cases?.every((tc) => selectedTestCases.includes(tc.test_case_id))}
                       onChange={(event) => handleSuiteSelect(event, suite.test_suite_id, suite?.test_cases)}
                     />
                   </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="caption" sx={{ width: 90, ml: 2 }}>
                          {suite.test_suite_id}
                        </Typography>
                        <Typography variant="body2" sx={{ width: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                          {suite.test_suite_name}
                        </Typography>
                        {/* <Typography variant="body2" sx={{ flex: 1, ml: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {suite.test_suite_desc}
                        </Typography> */}
                        <Typography variant="caption" sx={{ width: 140, ml: 2, textAlign: "right" }}>
                          {suite._modified_by}
                        </Typography>
                      </Box>
                    }
                    secondary={null}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(suite.test_suite_id);
                    }}
                  />
                   <IconButton
                     onClick={(e) => {
                       e.stopPropagation();
                       handleToggleExpand(suite.test_suite_id);
                     }}
                   >
                     {expandedSuites[suite.test_suite_id] ? <ExpandLess /> : <ExpandMore />}
                   </IconButton>
                 </ListItemButton>
                 {/* Test case section */}
                 <Collapse in={expandedSuites[suite.test_suite_id]} timeout="auto" unmountOnExit>
                   <List component="div" disablePadding style={{ padding: "0" }}>
                     {suite?.test_cases?.map((tc) => (
                         <ListItem key={tc.test_case_id}>
                           <ListItemButton sx={{ p: 0, pl: 3 }}>
                             <ListItemIcon>
                               <Checkbox
                                 checked={selectedTestCases.includes(tc.test_case_id)}
                                 onChange={() => handleTestCaseSelect(tc.test_case_id)}
                               />
                             </ListItemIcon>
                             <ListItemText
                               
                               // primaryTypographyProps={{ noWrap: true }}
                               primary={<small>{tc.test_case_id} - {tc.test_case_name} </small>}
                             />
                           </ListItemButton>
                         </ListItem>
                       ))}
                   </List>
                 </Collapse>
               </div>
             ))}
           </List>
          </>
         )}
        {type === "release" && (
          <List disablePadding>
            {filteredOptions.map((cycle) => (
              <ListItem
                key={cycle.test_cycle_id}
                button
                sx={{ paddingTop: 0, paddingBottom: 0 }}
              >
                <ListItemIcon>
                  <Checkbox
                    value={cycle.test_cycle_id}
                    checked={selectedTestCases?.includes(cycle.test_cycle_id)}
                    onChange={handleCheckBoxClick}
                  />
                </ListItemIcon>
                <ListItemText primary={cycle.test_cycle_name} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpen(false)}
          size="small"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          style={{
            margin: "9px 20px",
          }}
          size="small"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultiselectDialog;
