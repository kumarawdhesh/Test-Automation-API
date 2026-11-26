import { Box, Modal, Button,
        ButtonGroup,
        TextField,
        Typography,
        Select,
        MenuItem,
        InputLabel,
        FormControl,
        Dialog,
        DialogTitle,
        DialogContent,
        DialogActions,
        Popper,
        Grow,
        ClickAwayListener,
        MenuList,
        Paper,
    } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch } from "react-redux";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { useEffect, useRef, useState } from "react";
import { FALCON_API } from "../../../environment";
import { getDataFromStorage } from "../../utils/utility";
import { AddCircle, ArrowDropDown, Download, Replay, Upload, UploadFile } from "@mui/icons-material";
import { redirectToLogin } from "../../store/apiSlice";
import BulkUploadFalconLite from "./BulkUploadFalconLite";
import { useDownloadBulkUploadTemplateMutation } from "../../store/mdtSlice";

function Testcase({domains, testCases, selectedDomain, selectedTestCases, setSelectedTestCases, openCycleModal, setOpenCycleModal, cycleName, setCycleName, openEditModal, setOpenEditModal, editTestCase, setEditTestCase, openDeleteDialog, setOpenDeleteDialog, deleteTestCase, fetchTCsAndExecutionHistory}) {
    const dispatch = useDispatch();

    const [selectedWorkspace, setSelectedWorkspace] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [filteredTestCases, setFilteredTestCases] = useState([]);
    const [uploadOptionOpen, setUploadOptionOpen] = useState(false);
    const anchorUploadRef = useRef(null);
    const [openBulkUploadOpen, setOpenBulkUploadOpen] = useState(false);
    const [fileContent, setFileContent] = useState([]);
      
    const [ downloadBulkUploadTemplate ] = useDownloadBulkUploadTemplateMutation();

    useEffect(() => {
        if (domains.length > 0 && selectedWorkspace === "") {
            setSelectedWorkspace(domains[0].workspace_id);
        }
    }, [domains]);
    
    // Test Case Table Columns
    const testCaseColumns = [
        { field: "test_case_id", headerName: "Test Case ID", flex: 1 },
        { field: "test_case_name", headerName: "Test Case Name", flex: 2 },
        // { field: "source_db", headerName: "DB Connection", flex: 2 },
        { field: "target_sql", headerName: "Expected SQL", flex: 2 },
        { field: "modified_by", headerName: "Modified By", flex: 1 },
        { field: "modified_at", headerName: "Modified At", flex: 1 },
        // {
        //   field: "actions",
        //   headerName: "Actions",
        //   flex: 1,
        //   sortable: false,
        //   renderCell: (params) => (
        //     <>
        //       <Tooltip title="Edit">
        //         <IconButton
        //             disabled
        //             size="small"
        //             onClick={(e) => {
        //                 e.stopPropagation();
        //                 setEditTestCase(params.row);
        //                 setOpenEditModal(true);
        //             }}
        //         >
        //           <EditIcon fontSize="small" />
        //         </IconButton>
        //       </Tooltip>
        //     </>
        //   ),
        // },
    ];

    const handleCreateAndExecuteCycle = () => {
        if (!cycleName || selectedWorkspace === "") {
            dispatch(showSnackbar({
                message: "Please provide a cycle name and select a workspace",
                className: "color-error-background width-50",
            }));
            return;
        }
        setIsCreating(true); // <-- Set loading state
        fetch(`${FALCON_API}/falcon-lite`, {
            method: "POST",
            body: JSON.stringify({
                function_name: "nexus-lite-execution",
                user_id: sessionStorage.getItem("username"),
                release_date: new Date().toISOString(),
                test_cycle_name: cycleName,
                // connection_id: domains.find((wk) => wk.workspace_id === selectedWorkspace)?.connection_id,
                workspace_id: selectedWorkspace,
                test_cases: selectedTestCases,
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getDataFromStorage("token")}`,
                IdentityProvider: "aws_cognito",
                ApplicationName: "falcon",
            },
        })
        .then((response) => {			
            if (response.status === 401) {
                dispatch(closeLoading());
                // Unauthorized, redirect to login
                redirectToLogin();
                return;
            }
            return response.json();
        })
        .then((response) => {
            if (response && response.data && response.statusCode === 200) {
                dispatch(showSnackbar({
                    message: "Test Cycle Created and Execution Triggered",
                    className: "color-success-background width-50",
                }));
                setOpenCycleModal(false);
                setCycleName("");
                setSelectedTestCases([]);
                fetchTCsAndExecutionHistory(selectedDomain);
            } else {
                dispatch(showSnackbar({
                    message: response?.message || "Failed to create test cycle",
                    className: "color-error-background width-50",
                }));
                console.error("Failed to create test cycle:", response);
            }
        })
        .catch((error) => {
            dispatch(showSnackbar({
                message: "Error creating test cycle",
                className: "color-error-background width-50",
            }));
            console.error("Error creating Nexus Test Cycle:", error);
        })
        .finally(() => {
            setIsCreating(false); // <-- Reset loading state
        });
    }  

    const handleUploadGButtonClick = () => {
        setUploadOptionOpen(!uploadOptionOpen);
    }

    const handleUploadButtonClose = (event) => {
        if (anchorUploadRef.current && anchorUploadRef.current.contains(event.target)) {
            return;
        }

        setUploadOptionOpen(false);
    };

    const downloadFile = async () => {        
        try {
            dispatch(showLoading());
            const { data: response, error } = await downloadBulkUploadTemplate({
                function_name: "get-falcon-lite-bulk-upload-template",
                domain_name: selectedDomain,
                user_id: sessionStorage.getItem("username"),
            });			
        
            if (response && response.statusCode === 200) {
                const link = document.createElement("a");
                link.href = response.body;
                document.body.appendChild(link);
                link.click();
                URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
                dispatch(closeLoading())
            } else {
                dispatch(closeLoading())
                dispatch(
                    showSnackbar({
                        message: response.body,
                        className: "color-error-background width-50",
                    })
                );
            }
        } catch (error) {
            dispatch(closeLoading())
            console.error("Error downloading bulk upload template:", error);
        }
    };

    return (
        <>
            <Box sx={{ mb: 4, mt: -6, display: "flex", justifyContent: "flex-end" }}>
                { (selectedDomain && testCases.length > 0) && (
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Test Case ID or Name"
                        sx={{ mr: 2, width: 280 }}
                        onChange={(() => {
                            let timeout;
                            return (e) => {
                                const value = e.target.value.toLowerCase();
                                clearTimeout(timeout);
                                timeout = setTimeout(() => {
                                    if (value === "") {
                                        setFilteredTestCases([]);
                                        return;
                                    }
                                    const filtered = testCases.filter(
                                        (tc) =>
                                            tc.test_case_id.toString().includes(value) ||
                                            tc.test_case_name.toLowerCase().includes(value)
                                    );                                    
                                    setFilteredTestCases(filtered);
                                }, 300);
                            };
                        })()}
                    />
                )}

                <ButtonGroup
                    variant="contained"
                    ref={anchorUploadRef}
                    aria-label="Upload File Options"
                    disabled={selectedDomain === ""}
                >
                    <Button startIcon={<UploadFile />} onClick={handleUploadGButtonClick}>{"Bulk Upload"}</Button>
                    <Button
                        size="small"
                        aria-controls={uploadOptionOpen ? 'split-button-menu' : undefined}
                        aria-expanded={uploadOptionOpen ? 'true' : undefined}
                        aria-haspopup="menu"
                        onClick={handleUploadGButtonClick}
                    >
                        <ArrowDropDown />
                    </Button>
                </ButtonGroup>

                <Popper
                    sx={{ zIndex: 1 }}
                    open={uploadOptionOpen}
                    anchorEl={anchorUploadRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                        transformOrigin:
                            placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleUploadButtonClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                        <MenuItem onClick={downloadFile}>
                                            <Download sx={{ mr: "5px" }} fontSize="10px"/> Download Template
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                setOpenBulkUploadOpen(true);
                                            }}
                                        >
                                            <Upload sx={{ mr: "5px" }} fontSize="10px" /> Upload Test Cases
                                        </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                    )}
                </Popper>

                <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                    startIcon={<AddCircle />}
                    disabled={selectedTestCases.length === 0}
                    onClick={() => setOpenCycleModal(true)}
                >
                    Create Executions
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                    startIcon={<Replay />}
                    disabled={selectedDomain === ""}
                    onClick={() => {
                        fetchTCsAndExecutionHistory(selectedDomain);
                    }}
                >
                    Refresh
                </Button>
            </Box>

            <DataGrid
                autoHeight
                rows={filteredTestCases.length > 0 ? filteredTestCases : testCases}
                columns={testCaseColumns}
                getRowId={(row) => row.test_case_id}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(selectedRows) => {
                    let selectedIds = [];
                    if (Array.isArray(selectedRows)) {
                        selectedIds = selectedRows;
                    } else if (selectedRows && typeof selectedRows === 'object') {
                        // Handle complex selection object {type, ids}
                        const currentRows = filteredTestCases.length > 0 ? filteredTestCases : testCases;
                        if (selectedRows.type === 'include') {
                            selectedIds = Array.from(selectedRows.ids || []);
                        } else if (selectedRows.type === 'exclude') {
                            // If excluding, get all IDs except the excluded ones
                            const allIds = currentRows.map(row => row.test_case_id);
                            const excludedIds = new Set(selectedRows.ids);
                            selectedIds = allIds.filter(id => !excludedIds.has(id));
                        }
                    }
                    setSelectedTestCases(selectedIds);
                 }}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 5, page: 0 } }
                }}
                pagination
                slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            />

            {/* Create Test Cycle Modal */}
            <Modal
                open={openCycleModal}
                onClose={() => setOpenCycleModal(false)}
                aria-labelledby="create-cycle-modal"
                >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        minWidth: 350,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" mb={2}><b>Create Test Execution</b></Typography>
                    <TextField
                        label="Execution Name"
                        fullWidth
                        size="small"
                        value={cycleName}
                        onChange={(e) => setCycleName(e.target.value)}
                        sx={{ mb: 2 }}
                        />
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id="workspace-label">Workspace</InputLabel>
                        <Select
                            labelId="workspace-label"
                            value={selectedWorkspace}
                            label="Workspace"
                            onChange={(e) => setSelectedWorkspace(e.target.value)}
                            sx={{ mb: 2 }}
                        >
                            {domains
                            .filter((wk) => wk.domain_name === selectedDomain)
                            .map((wk) => (
                                <MenuItem key={wk.workspace_id} value={wk.workspace_id}>
                                    {wk.workspace_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateAndExecuteCycle}
                            disabled={
                                isCreating ||
                                !cycleName ||
                                selectedWorkspace === "" ||
                                selectedTestCases.length === 0
                            }
                        >
                            {isCreating ? "Creating..." : "Create and Execute"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenCycleModal(false)}
                            disabled={isCreating}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Edit Test Case Modal */}
            <Modal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            aria-labelledby="edit-testcase-modal"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        minWidth: 400,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                    Edit Test Case
                    </Typography>
                    {editTestCase && (
                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                        label="Test Case Name"
                        value={editTestCase.name}
                        onChange={(e) =>
                            setEditTestCase({ ...editTestCase, name: e.target.value })
                        }
                        />
                        <TextField
                        label="DB Connection"
                        value={editTestCase.dbConnection}
                        onChange={(e) =>
                            setEditTestCase({ ...editTestCase, dbConnection: e.target.value })
                        }
                        />
                        <TextField
                        label="Input to Nexus"
                        value={editTestCase.input}
                        onChange={(e) =>
                            setEditTestCase({ ...editTestCase, input: e.target.value })
                        }
                        />
                        <TextField
                        label="Expected SQL"
                        value={editTestCase.expectedSql}
                        onChange={(e) =>
                            setEditTestCase({ ...editTestCase, expectedSql: e.target.value })
                        }
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                            // Save logic here
                            setOpenEditModal(false);
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenEditModal(false)}
                        >
                            Cancel
                        </Button>
                        </Box>
                    </Box>
                    )}
                </Box>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete Test Case</DialogTitle>
                <DialogContent>
                    <Typography>
                    Are you sure you want to delete test case "{deleteTestCase?.name}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                    variant="contained"
                    onClick={() => {
                        setOpenDeleteDialog(false);
                    }}
                    >
                    Delete
                    </Button>
                    <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <BulkUploadFalconLite
                selectedDomain={selectedDomain}
                open={openBulkUploadOpen}
                onClose={setOpenBulkUploadOpen}
                fileContent={fileContent}
                setFileContent={setFileContent}
            />
        </>
    );
}

export default Testcase;

function CustomNoRowsOverlay() {
  return (
    <Box sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="body1" color="text.secondary">
        Please select domain or No test cases available for the selected domain.
      </Typography>
    </Box>
  );
}