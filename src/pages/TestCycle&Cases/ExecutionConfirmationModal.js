import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Paper, Select, Stack, styled, Switch, TextField, Typography, Tabs, Tab, Checkbox, FormControlLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as classes from "./TestCycle&Cases.module.css";
import { GUARDIAN_API } from "../../../environment";
import { getDataFromStorage } from "../../utils/utility";
import { redirectToLogin } from "../../store/apiSlice";
import { useGetIrisDomainListMutation } from "../../store/mdtSlice";
import { alignContent, alignItems } from "@mui/system";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    backgroundColor: 'rgba(255,255,255,.35)',
    ...theme.applyStyles('dark', {
          backgroundColor: 'rgba(255,255,255,.35)',
    }),
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1890ff',
        ...theme.applyStyles('dark', {
          backgroundColor: '#177ddc',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exec-tabpanel-${index}`}
      aria-labelledby={`exec-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export const ExecutionConfirmationModal = ({
    isDynamicSelection,
    runAllTestCaseFlag,
    openExecutionConfirmationModal, 
    handleCloseExecutionConfirmationModal,
    testCasesToExecute,
    executeTestCases,
    setRunWithoutDependecies
}) => {    
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        overflow:'auto',
        transform: 'translate(-50%, -50%)',
        minWidth: isDynamicSelection ? "95%" : "480px",
        maxWidth: "95%",
        maxHeight: "90vh",
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 2,
        display: "flex",
        flexDirection: "column"
    };    

    const { selectedOrgAppDetails } = useSelector((state) => state.data);

    const [irisTestcases, setIrisTestcases] = useState([]);
    const [nexusTestcases, setNexusTestcases] = useState([]);
    const [dataTestcases, setDataTestcases] = useState([]);
    const [nexusDomains, setNexusDomains] = useState([]);

    const [getIrisDomainList] = useGetIrisDomainListMutation();

    useEffect(() => {
        if(testCasesToExecute.length){
            setIrisTestcases(testCasesToExecute.filter(tc => tc.execution_engine === "Iris").map((tc) => {
                try{
                    return {
                        ...tc,
                        iris_version: JSON.parse(tc.source_sql)?.iris_version
                    }
                } catch(error){
                    return tc                    
                }
            }));
            setNexusTestcases(testCasesToExecute.filter(tc => tc.execution_engine === "Nexus"));
            setDataTestcases(testCasesToExecute.filter(tc => tc.test_case_type === "Data_Testing"));
        }
    }, [testCasesToExecute])

    useEffect(() => {       
        fetchSourceDBLists();
        fetchNexusDomains();
    }, []);

    const fetchNexusDomains = async () => {
        try {
            const { data: response, error } = await getIrisDomainList({
                function_name: "get-nexus-domains",
                user_id: sessionStorage.getItem("username"),
            })
            if (response && response.body && response.statusCode === 200) {
                setNexusDomains(response.body)
            }
            if (!!error) throw error;
        } catch (error) {
            console.error("Error fetching Nexus domains:", error);
        }
    }

    const fetchSourceDBLists = async () => {
        const token = getDataFromStorage("token");

        fetch(`${GUARDIAN_API}&domainName=${selectedOrgAppDetails.orgName}&subDomainName=${selectedOrgAppDetails.appName}`, {
            method: "GET",
            headers: {
                Authorization: `${token}`,
                IdentityProvider: "aws_cognito"
            },
        })
        .then((response) => {
            if (response.status === 401) {
                // Unauthorized, redirect to login
                redirectToLogin();
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.statusCode === 200) {
                setSourceDBList(data.connection_name);
            }
        })
        .catch(error => {
            console.error("Error fetching connection details:", error);
        });

    };
    
    const [sourceDBList, setSourceDBList] = useState([]);        
    const [tabIndex, setTabIndex] = useState(0);
    const [showDependencies, setShowDependencies] = useState(true);
    const [editingRow, setEditingRow] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editType, setEditType] = useState(null); // 'data', 'iris', 'nexus'

    const handleTabChange = (event, newValue) => {
      setTabIndex(newValue);
    };

    const handleExecuteTestCase = () => {
        executeTestCases([
            ...irisTestcases.map(itc => ({
                test_case_id: itc.test_case_id,
                test_case_name: itc.test_case_name,    
                source_connection_type : itc.source_connection,
                source_connection: itc.workspace_id ? itc.workspace_id : itc.source_db,
                iris_version: itc.iris_version,
                test_suite_name: itc.test_suite_name,
                test_suite_id: itc.test_suite_id,
                execution_engine: itc.execution_engine,
                depends_on: itc.depends_on,
            })),
            ...nexusTestcases.map(ntc => ({
                test_case_id: ntc.test_case_id,
                test_case_name: ntc.test_case_name,
                source_connection_type: ntc.source_connection,
                source_connection: ntc.source_db,
                test_suite_name: ntc.test_suite_name,
                test_suite_id: ntc.test_suite_id,
                execution_engine: ntc.execution_engine,
                workspace_id: ntc.workspace_id,
                iris_version: ntc.iris_version,
                depends_on: ntc.depends_on,
            })),
            ...dataTestcases.map(dtc => ({
                test_case_id: dtc.test_case_id,
                test_case_name: dtc.test_case_name,
                target_connection_type: dtc.target_connection,
                target_connection: dtc.target_db,
                source_connection_type: dtc.source_connection,
                source_connection: dtc.source_db,
                test_suite_name: dtc.test_suite_name,
                test_suite_id: dtc.test_suite_id,
                depends_on: dtc.depends_on,
            }))
        ]);
    }    

    const handleEditClick = (row, type) => {
        setEditingRow(row);
        setEditType(type);
        setEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (editType === 'data') {
            setDataTestcases(dataTestcases.map(tc =>
                tc.test_case_id === editingRow.test_case_id ? editingRow : tc
            ));
        } else if (editType === 'iris') {
            setIrisTestcases(irisTestcases.map(tc =>
                tc.test_case_id === editingRow.test_case_id ? editingRow : tc
            ));
        } else if (editType === 'nexus') {
            setNexusTestcases(nexusTestcases.map(tc =>
                tc.test_case_id === editingRow.test_case_id ? editingRow : tc
            ));
        }
        setEditModalOpen(false);
        setEditingRow(null);
    };

    const handleFieldChange = (field, value) => {
        setEditingRow(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const dataTestcasesColumns = [
        { field: 'test_case_id', headerName: 'Test Case ID', width: 120, sortable: true },
        { field: 'test_case_name', headerName: 'Test Case Name', width: 180, sortable: true },
        { field: 'test_suite_name', headerName: 'Test Suite Name', width: 150, sortable: true },
        { field: 'source_connection', headerName: 'Source Connection Type', width: 150 },
        { field: 'source_db', headerName: 'Source Connection', width: 150 },
        { field: 'target_connection', headerName: 'Target Connection Type', width: 150 },
        { field: 'target_db', headerName: 'Target Connection', width: 150 },
        ...(showDependencies ? [
            { 
                field: 'depends_on', 
                headerName: 'Depends On', 
                width: 200, 
                valueFormatter: (params) => {
                    if (Array.isArray(params) && params.length > 0) {
                        return params.join(", ");
                    }
                    return "None";
                }
            }
        ] : []),
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleEditClick(params.row, 'data')}
                    sx={{ color: '#0ea5e9' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    const irisTestcasesColumns = [
        { field: 'test_case_id', headerName: 'Test Case ID', width: 120, sortable: true },
        { field: 'test_case_name', headerName: 'Test Case Name', width: 180, sortable: true },
        { field: 'test_suite_name', headerName: 'Test Suite', width: 150, sortable: true },
        {
            field: 'execution_engine',
            headerName: 'Execution Engine',
            width: 180,
            renderCell: (params) => (
                params.row.execution_engine
            ),
        },
        { field: 'iris_version', headerName: 'Iris Version', width: 160 },
        { field: 'source_db', headerName: 'Database Connection', width: 150 },
        { field: 'workspace_id', headerName: 'Workspace', width: 180 },
        ...(showDependencies ? [
            { 
                field: 'depends_on', 
                headerName: 'Depends On', 
                width: 200, 
                valueFormatter: (params) => {
                    if (Array.isArray(params) && params.length > 0) {
                        return params.join(", ");
                    }
                    return "None";
                }
            }
        ] : []),
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleEditClick(params.row, 'iris')}
                    sx={{ color: '#0ea5e9' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    const nexusTestcasesColumns = [
        { field: 'test_case_id', headerName: 'Test Case ID', width: 120, sortable: true },
        { field: 'test_case_name', headerName: 'Test Case Name', width: 180, sortable: true },
        { field: 'test_suite_name', headerName: 'Test Suite', width: 150, sortable: true },
        {
            field: 'execution_engine',
            headerName: 'Execution Engine',
            width: 180,
            renderCell: (params) => (
                params.row.execution_engine
            ),
        },
        { field: 'workspace_id', headerName: 'Workspace', width: 180 },
        { field: 'iris_version', headerName: 'Iris Version', width: 160 },
        { field: 'source_db', headerName: 'Database Connection', width: 150 },
        ...(showDependencies ? [
            { 
                field: 'depends_on', 
                headerName: 'Depends On', 
                width: 200, 
                valueFormatter: (params) => {
                    if (Array.isArray(params) && params.length > 0) {
                        return params.join(", ");
                    }
                    return "None";
                }
            }
        ] : []),
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleEditClick(params.row, 'nexus')}
                    sx={{ color: '#0ea5e9' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    const renderEditModal = () => {
        if (!editingRow) return null;

        return (
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Test Case Details</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {editType === 'data' && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Source Connection</InputLabel>
                                <Select
                                    value={editingRow.source_db || ""}
                                    label="Source Connection"
                                    onChange={(e) => handleFieldChange('source_db', e.target.value)}
                                >
                                    {sourceDBList?.[editingRow.source_connection]?.map((conn) => (
                                        <MenuItem key={conn.connectionName} value={conn.connectionName}>
                                            {conn.connectionName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Target Connection</InputLabel>
                                <Select
                                    value={editingRow.target_db || ""}
                                    label="Target Connection"
                                    onChange={(e) => handleFieldChange('target_db', e.target.value)}
                                >
                                    {sourceDBList?.[editingRow.target_connection]?.map((conn) => (
                                        <MenuItem key={conn.connectionName} value={conn.connectionName}>
                                            {conn.connectionName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}

                    {editType === 'iris' && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Execution Engine</InputLabel>
                                <Select
                                    value={editingRow.execution_engine || ""}
                                    label="Execution Engine"
                                    onChange={(e) => handleFieldChange('execution_engine', e.target.value)}
                                >
                                    <MenuItem value="Iris">Iris</MenuItem>
                                    <MenuItem value="Nexus">Nexus</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={editingRow.execution_engine === "Nexus"}>
                                <InputLabel>Iris Version</InputLabel>
                                <Select
                                    value={editingRow.iris_version || ""}
                                    label="Iris Version"
                                    onChange={(e) => handleFieldChange('iris_version', e.target.value)}
                                >
                                    <MenuItem value={"Iris_DEV_V2"}>Iris_DEV</MenuItem>
                                    <MenuItem value={"Iris_UAT_V2"}>Iris_UAT</MenuItem>
                                    <MenuItem value={"Iris_PROD_V2"}>Iris_PROD</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={editingRow.execution_engine === "Nexus"}>
                                <InputLabel>Database Connection</InputLabel>
                                <Select
                                    value={editingRow.source_db || ""}
                                    label="Database Connection"
                                    onChange={(e) => handleFieldChange('source_db', e.target.value)}
                                >
                                    {sourceDBList?.Snowflake?.map((conn) => (
                                        <MenuItem key={conn.connectionName} value={conn.connectionName}>
                                            {conn.connectionName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={editingRow.execution_engine === "Iris"}>
                                <InputLabel>Workspace</InputLabel>
                                <Select
                                    value={editingRow.workspace_id || ""}
                                    label="Workspace"
                                    onChange={(e) => handleFieldChange('workspace_id', e.target.value)}
                                >
                                    {nexusDomains.map((domain) => (
                                        <MenuItem value={domain.workspace_id} key={domain.workspace_id}>
                                            {domain.workspace_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}

                    {editType === 'nexus' && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Execution Engine</InputLabel>
                                <Select
                                    value={editingRow.execution_engine || ""}
                                    label="Execution Engine"
                                    onChange={(e) => handleFieldChange('execution_engine', e.target.value)}
                                >
                                    <MenuItem value="Iris">Iris</MenuItem>
                                    <MenuItem value="Nexus">Nexus</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={editingRow.execution_engine === "Nexus"}>
                                <InputLabel>Iris Version</InputLabel>
                                <Select
                                    value={editingRow.iris_version || ""}
                                    label="Iris Version"
                                    onChange={(e) => handleFieldChange('iris_version', e.target.value)}
                                >
                                    <MenuItem value={"Iris_DEV_V2"}>Iris_DEV</MenuItem>
                                    <MenuItem value={"Iris_UAT_V2"}>Iris_UAT</MenuItem>
                                    <MenuItem value={"Iris_PROD_V2"}>Iris_PROD</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={editingRow.execution_engine === "Nexus"}>
                                <InputLabel>Database Connection</InputLabel>
                                <Select
                                    value={editingRow.source_db || ""}
                                    label="Database Connection"
                                    onChange={(e) => handleFieldChange('source_db', e.target.value)}
                                >
                                    {sourceDBList?.Snowflake?.map((conn) => (
                                        <MenuItem key={conn.connectionName} value={conn.connectionName}>
                                            {conn.connectionName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={editingRow.execution_engine === "Iris"}>
                                <InputLabel>Workspace</InputLabel>
                                <Select
                                    value={editingRow.workspace_id || ""}
                                    label="Workspace"
                                    onChange={(e) => handleFieldChange('workspace_id', e.target.value)}
                                >
                                    {nexusDomains.map((domain) => (
                                        <MenuItem value={domain.workspace_id} key={domain.workspace_id}>
                                            {domain.workspace_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" sx={{ background: "#0ea5e9 !important" }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return <Modal
        open={openExecutionConfirmationModal}
        onClose={handleCloseExecutionConfirmationModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={style}>
            <Box >
              <Typography sx={{ fontWeight: 700 }} id="modal-modal-title" variant="subtitle1" component="h2">
                Execution Confirmation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {runAllTestCaseFlag ? "You are about to run all test cases in the selected test cycle." : `${testCasesToExecute.length} selected`}
              </Typography>
            </Box>

            {isDynamicSelection && (
                <FormControlLabel
                    control={
                        <Checkbox checked={showDependencies} onChange={(e) => {setShowDependencies(e.target.checked); setRunWithoutDependecies(!e.target.checked)}} />
                    }
                    label="Enable Dependencies"
                    sx={{ mt: 1, mb: 2 }}
                />
            )}
            
            {isDynamicSelection && 
                <Paper variant="outlined" sx={{ width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        aria-label="Execution tabs"
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label={`Data Testcases (${dataTestcases.length})`} id="exec-tab-0" aria-controls="exec-tabpanel-0" />
                        <Tab label={`Iris (${irisTestcases.length})`} id="exec-tab-1" aria-controls="exec-tabpanel-1" />
                        <Tab label={`Nexus (${nexusTestcases.length})`} id="exec-tab-2" aria-controls="exec-tabpanel-2" />
                    </Tabs>

                    <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
                        <TabPanel value={tabIndex} index={0}>
                        {!!dataTestcases.length ? (
                            <Box sx={{ height: 400, overflowY: "auto", width: '100%' }}>
                                <DataGrid
                                    rows={dataTestcases}
                                    columns={dataTestcasesColumns}
                                    getRowId={(row) => row.test_case_id}
                                    pageSizeOptions={[10, 25, 50]}
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 10 } },
                                    }}
                                    onCellEditStop={(params) => {
                                        setDataTestcases(dataTestcases.map(tc =>
                                            tc.test_case_id === params.id ? { ...tc, [params.field]: params.value } : tc
                                        ));
                                    }}
                                    disableSelectionOnClick
                                />
                            </Box>
                        ) : <Typography color="text.secondary">No Data Testcases</Typography>}
                        </TabPanel>

                        <TabPanel value={tabIndex} index={1}>
                        {!!irisTestcases.length ? (
                            <Box sx={{ height: 400, overflowY: "auto", width: '100%' }}>
                                <DataGrid
                                    rows={irisTestcases}
                                    columns={irisTestcasesColumns}
                                    getRowId={(row) => row.test_case_id}
                                    pageSizeOptions={[10, 25, 50]}
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 10 } },
                                    }}
                                    onCellEditStop={(params) => {
                                        setIrisTestcases(irisTestcases.map(tc =>
                                            tc.test_case_id === params.id ? { ...tc, [params.field]: params.value } : tc
                                        ));
                                    }}
                                    disableSelectionOnClick
                                />
                            </Box>
                        ) : <Typography color="text.secondary">No Iris Testcases</Typography>}
                        </TabPanel>

                        <TabPanel value={tabIndex} index={2}>
                        {!!nexusTestcases.length ? (
                            <Box sx={{ height: 400, overflowY: "auto", width: '100%' }}>
                                <DataGrid
                                    rows={nexusTestcases}
                                    columns={nexusTestcasesColumns}
                                    getRowId={(row) => row.test_case_id}
                                    pageSizeOptions={[10, 25, 50]}
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 10 } },
                                    }}
                                    onCellEditStop={(params) => {
                                        setNexusTestcases(nexusTestcases.map(tc =>
                                            tc.test_case_id === params.id ? { ...tc, [params.field]: params.value } : tc
                                        ));
                                    }}
                                    disableSelectionOnClick
                                />
                            </Box>
                        ) : <Typography color="text.secondary">No Nexus Testcases</Typography>}
                        </TabPanel>
                    </Box>
                </Paper>
            }

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                <Button 
                    variant="outlined" 
                    className={classes.btn}
                    onClick={handleCloseExecutionConfirmationModal}
                >Close</Button>
                <Button
                    onClick={handleExecuteTestCase}
                    variant="contained"
                    className={classes.btn}
                    size="small"
                    sx={{
                        background: "#0ea5e9 !important",
                        color: "#fff !important",
                    }}
                >
                    Proceed
                </Button>
            </Box>
            {renderEditModal()}
        </Box>
    </Modal>
}

    // const [useDefault, setUseDefault] = useState(true);
    // const [irisVersion, setIrisVersion] = useState("");
    // const [connectionType, setConnectionType] = useState(""); // This holds the selected
    // const [targetConnectionType, setTargetConnectionType] = useState(""); 
    // const [irisSourceDBList, setIrisSourceDBList] = useState([]);
    // const [irisSourceDB, setIrisSourceDB] = useState("")
    // const [normalSourceDBList, setNormalSourceDBList] = useState([]);
    // const [normalTargetDBList, setNormalTargetDBList] = useState([]);
    // const [sourceDB, setSourceDB] = useState("");
    // const [targetDB, setTargetDB] = useState("");
    // const [validationError, setValidationError] = useState(false);

// const handleExecuteTestCaseConfirmation = (testCaseIds) => {
//     const confirmDialog = {
//       open: true,
//       titleText: "Execute Confirmation",
//       innerText: "Are you sure you want to execute all the test cases?",
//       buttonText: {
//         cancel: "Cancel",
//         confirm: "Confirm",
//       },
//       onConfirm: async () => {
//         await executeTestCases(testCaseIds);
//       },
//       onCancel: () => {
//         consoleLog("info", "dialog close");
//       },
//     };
//     dispatch(openDialog(confirmDialog));
//   };