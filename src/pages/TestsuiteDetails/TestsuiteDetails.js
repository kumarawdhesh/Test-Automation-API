import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useDeleteTestCaseMutation } from "../../store/mdtSlice";
import { closeLoading, showLoading, showSnackbar, openDialog } from "../../store/appSlice";
import { DataGrid } from "@mui/x-data-grid";
import * as classes from "./TestsuiteDetails.module.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete, Edit, Search as SearchIcon, Visibility, MoreVert } from "@mui/icons-material";
import { checkUserAccess, consoleLog, getDataFromStorage, showReadOnlySnackbar } from "../../utils/utility";
import SQLViewDialog from "../../components/SQLViewDialog/SQLViewDialog";
import ViewTestBaselineDialog from "../../components/ViewTestBaselineDialog/ViewTestBaselineDialog";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 150,
    },
  },
};

const TestsuiteDetails = ({ testSuite, handleAddTestCase }) => {
  const { test_cases: testcases } = testSuite;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState([]);
  // const [searchTestcase, setSearchTestcase] = useState("");
  // const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSqlQueryDialog, setOpenSqlQueryDialog] = useState(false);
  const [sqlQueryContent, setSqlQueryContent] = useState("");
  const [title, setTitle] = useState("");
  const [irisTestCases, setIrisTestCases] = useState([]);
  const [nexusTestCases, setNexusTestCases] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openBaselineDialog, setOpenBaselineDialog] = useState(false);
  const [baselineData, setBaselineData] = useState(null);
  const accessCheck = checkUserAccess();

  const [deleteTestCase] = useDeleteTestCaseMutation();

  const processTestCases = (tcs) => {
    const ntc = [];
    const itc = [];
    const nexusTc = [];

    tcs.forEach((tc) => {
      if(tc.test_config.test_case_type === "NLQ_Testing" && tc.test_config.execution_engine === "Nexus") {
        nexusTc.push(tc);
      } else if (tc.test_config.test_case_type === "NLQ_Testing" && tc.test_config.execution_engine === "Iris") {
        itc.push(tc);
      } else {
        ntc.push(tc);
      }
    });

    return { ntc, itc, nexusTc };
  };

  useEffect(() => {
    if(testcases.length) {      
      const { ntc, itc, nexusTc } = processTestCases(testcases);
      
      setTestCases(ntc);
      setIrisTestCases(itc);
      setNexusTestCases(nexusTc);
    }
  }, [testcases]);


  const handleDeleteTestCaseConfirmation = (testcase, event) => {
    event.stopPropagation();
    if (accessCheck) {
      const confirmDialog = {
        open: true,
        titleText: "Delete Confirmation",
        innerText: `Are you sure you want to Delete Test Case - ${testcase.test_case_name} ?`,
        buttonText: {
          cancel: "Cancel",
          confirm: "Confirm",
        },
        onConfirm: () => {          
          handleDeleteTestCase(testcase.test_case_id, testcase.test_config.execution_engine, event);
        },
      };
      dispatch(openDialog(confirmDialog));
    } else {
      showReadOnlySnackbar(dispatch);
    }
  };

  const handleDeleteTestCase = async (id, executionEngine, event) => {
    event.stopPropagation();
    try {
      const { data: response, error } = await deleteTestCase({
        function_name: "test-case-delete",
        user_id: sessionStorage.getItem("username"),
        test_case_id: id,
      });
      if (response && response.statusCode === 200) {
        
        if (executionEngine === "Iris") {
          const updatedIrisTestCases = irisTestCases.filter((testCase) => testCase.test_case_id !== id);
          setIrisTestCases(updatedIrisTestCases);

        } else if(executionEngine === "Nexus") {
          const updatedNexusTestCases = nexusTestCases.filter((testCase) => testCase.test_case_id !== id);
          setNexusTestCases(updatedNexusTestCases);

        } else {
          const updatedTestCases = testCases.filter((testCase) => testCase.test_case_id !== id);
          setTestCases(updatedTestCases);

        }
        dispatch(
          showSnackbar({
            message: response?.message,
            className: "color-success-background width-50",
          })
        );
      } else {
        dispatch(
          showSnackbar({
            message: response?.message,
            className: "color-error-background width-50",
          })
        );
      }
      if (error) {
        console.error("Error deleting test case:", error);
      }
    } catch (error) {
      console.error("Error deleting test case:", error);
    }
  };

  const handleEditTestCase = (testCase, event) => {
    event.stopPropagation();
    let testcaseName = testCase.test_case_name;
    testcaseName = testcaseName.replace(/\s+/g, "-");
    let testCaseType;
    if(testCase.test_config.test_case_type === "NLQ_Testing" && testCase.test_config.execution_engine === "Iris") {
      testCaseType = "ExistingIrisTestCase";
    } else if(testCase.test_config.test_case_type === "NLQ_Testing" && testCase.test_config.execution_engine === "Nexus") {
      testCaseType = "ExistingNexusTestCase";
    } else if(testCase.test_config.test_case_type === "Data_Testing") {
      testCaseType = "ExistingNormalTestCase";
    }
    if (accessCheck) {
      navigate(`/testcase/${testcaseName}`, {
        state: {
          testCaseData: {
            ...testCase,
            created_at: testCase._created_at,
            created_by: testCase._created_by,
            key_cols: testCase.test_config.key_cols_override,
            modified_at: testCase._modified_at,
            modified_by: testCase._modified_by,
            source_connection: testCase.test_config.source_connection.type,
            source_db: testCase.test_config.source_connection.name,
            source_sql: testCase.test_config.queries.source_sql,
            target_connection: testCase.test_config.target_connection.type,
            target_db: testCase.test_config.target_connection.name,
            target_sql: testCase.test_config.queries.target_sql,
            test_case_type: testCase.test_config.test_case_type,
            test_config_id: testCase.test_config.tc_config_id,
            test_scenario: testCase.test_config.test_scenario,
            test_suite_desc: testSuite.test_suite_desc,
            test_suite_id: testSuite.test_suite_id,
            test_suite_name: testSuite.test_suite_name,
            is_multi_step_enabled: testCase.is_multi_step_enabled,
            multi_step_types: testCase.multi_step_types,
            steps: testCase.steps,
          },
          testCaseType,
        },
      });
    } else {
      showReadOnlySnackbar(dispatch);
    }
  };

  // const handleChange = (event) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setSelectedTypes(typeof value === "string" ? value.split(",") : value);
  // };

  const handleOpenDialog = (content, title, event) => {
    event.stopPropagation();
    setSqlQueryContent(content);
    setTitle(title);
    setOpenSqlQueryDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenSqlQueryDialog(false);
  };

  const handlePopoverOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleMenuItemClick = (action, event) => {
    if (action === 'edit') {
      handleEditTestCase(selectedRow, event);
    } else if (action === 'delete') {
      handleDeleteTestCaseConfirmation(selectedRow, event);
    } else if (action === 'view_multi_step') {
      setBaselineData(selectedRow);
      setOpenBaselineDialog(true);
    }
    handlePopoverClose();
  };

  const columns = [
    {
      field: "test_case_id",
      headerName: "Test Case Id",
      flex: 3,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
      description: "Test Case Id",
    },
    {
      field: "test_case_name",
      headerName: "Test Case Name",
      flex: 2,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
    },
    {
      field: "source_db",
      dataId: "source_db",
      headerName: "Source Connection",
      flex: 3,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (params.row.test_config.source_connection.name);
      }
    },
    {
      field: "source_sql",
      headerName: "Source Sql",
      flex: 3,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
      description: "Source Sql",
      renderCell: (params) => {
        const query = params?.row?.test_config?.queries?.source_sql;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              PopperProps={{ placement: 'top-start' }}
               title={
                 !openSqlQueryDialog && (
                   <Typography
                     style={{ cursor: "pointer" }}
                     onClick={(event) => handleOpenDialog(query, "SQL Query", event)}
                     variant="subtitle2"
                   >
                     {"view more"}
                   </Typography>
                 )
               }
               arrow
             >
               <span className={classes["query-content"]}>{query}</span>
             </Tooltip>
           </div>
         );
       },
    },
    {
      dataId: "target_db", // This field is added here to filter out using wherever required
      field: "target_db",
      headerName: "Target Connection",
      flex: 3,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (params.row.test_config.target_connection.name);
      }
    },
    {
      field: "target_sql",
      headerName: "Target Sql",
      flex: 3,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
      description: "Target Sql",
      renderCell: (params) => {
        const query = params?.row?.test_config?.queries?.target_sql;

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              PopperProps={{ placement: 'top-start' }}
               title={
                 !openSqlQueryDialog && (
                   <Typography
                     style={{ cursor: "pointer" }}
                     onClick={(event) =>
                       handleOpenDialog(query, "Target Query", event)
                     }
                     variant="subtitle2"
                   >
                     {"view more"}
                   </Typography>
                 )
               }
               arrow
             >
               <span className={classes["query-content"]}>{query}</span>
             </Tooltip>
           </div>
         );
       },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 5,
      sortable: false,
      // headerClassName: classes["header"],
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Box>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Tooltip arrow placement="left" title="Edit" PopperProps={{ disablePortal: true }}>
                <IconButton
                  className="color-icon"
                  onClick={(event) => handleEditTestCase(params.row, event)}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Delete"
                arrow placement="right"
                PopperProps={{ disablePortal: true }}>
                <IconButton
                  className="color-icon"
                  onClick={(event) => {
                    handleDeleteTestCaseConfirmation(params.row, event);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </Box>
        );
      },
    },
  ];

  const dataColumns = [
    {
      field: "test_case_id",
      headerName: "Test Case Id",
      flex: 3,
      headerAlign: "center",
      align: "center",
      description: "Test Case Id",
    },
    {
      field: "test_case_name",
      headerName: "Test Case Name",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "source_db",
      dataId: "source_db",
      headerName: "Source Connection",
      flex: 3,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (params.row.test_config.source_connection.name);
      }
    },
    {
      field: "source_sql",
      headerName: "Source Sql",
      flex: 3,
      headerAlign: "center",
      align: "center",
      description: "Source Sql",
      renderCell: (params) => {

        const query = params?.row?.test_config?.queries?.source_sql;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              PopperProps={{ placement: 'top-start' }}
              title={
                !openSqlQueryDialog && (
                  <Typography
                    style={{ cursor: "pointer" }}
                    onClick={(event) => handleOpenDialog(query, "SQL Query", event)}
                    variant="subtitle2"
                  >
                    {"view more"}
                  </Typography>
                )
              }
              arrow
            >
              <span className={classes["query-content"]}>{query}</span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      dataId: "target_db",
      field: "target_db",
      headerName: "Target Connection",
      flex: 3,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (params.row.test_config.target_connection.name);
      }
    },
    {
      field: "target_sql",
      headerName: "Target Sql",
      flex: 3,
      headerAlign: "center",
      align: "center",
      description: "Target Sql",
      renderCell: (params) => {
        const query = params?.row?.test_config?.queries?.target_sql;

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              PopperProps={{ placement: 'top-start' }}
              title={
                !openSqlQueryDialog && (
                  <Typography
                    style={{ cursor: "pointer" }}
                    onClick={(event) =>
                      handleOpenDialog(query, "Target Query", event)
                    }
                    variant="subtitle2"
                  >
                    {"view more"}
                  </Typography>
                )
              }
              arrow
            >
              <span className={classes["query-content"]}>{query}</span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 5,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Box>
            <IconButton
              onClick={(event) => handlePopoverOpen(event, params.row)}
            >
              <MoreVert />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Paper
      elevation={0}
      style={{
        margin: "0px 15px 15px 15px",
      }}
    >
      {/* <Grid
        item
        xs={12}
        sm={6}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={"10px"}
      >
        <Box>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTestcase}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
        </Box>
      </Grid> */}
      {/* Data Test case */}
      {testCases.length > 0 && (
        <Accordion
          defaultExpanded
          style={{
            marginBottom: "10px",
          }}
        >
          <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
            <Typography fontFamily={"Inter"}>Data Test case</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DataGrid
              loading={loading}
              rows={testCases}
              getRowId={(row) => row.test_case_id}
              columns={dataColumns}
              disableColumnMenu
              rowHeight={39}
              localeText={{
                noRowsLabel: "No Test Case found",
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              {...(testCases.length < 5 && {
                hideFooterPagination: true,
                hideFooter: true,
              })}
              sx={{
                ".css-1a12hj3-MuiToolbar-root-MuiTablePagination-toolbar": {
                  background: "white !important",
                  color: "black !important",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#d8d8d8",
                  minHeight: "40px !important",
                  maxHeight: "40px !important",
                },
                ".MuiSelect-icon": {
                  color: "black",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
      {irisTestCases.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
            <Typography fontFamily={"Inter"}>Iris Test case</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DataGrid
              loading={loading}
              rows={irisTestCases}
              getRowId={(row) => row.test_case_id}
              columns={[
                ...columns
                .filter((c) => c.dataId !== "target_db")
                .map((column) => {
                  if (column.field === "source_sql") {
                    return {
                      ...column,
                      headerName: "Input to IRIS",
                      description: "Input to IRIS",
                    };
                  }
                  if (column.field === "target_sql") {
                    return {
                      ...column,
                      headerName: "Expected SQL",
                      description: "Expected SQL"
                    }
                  }
                  if (column.dataId === "source_db") {
                    return {
                      ...column,
                      headerName: "DB Connection",
                      description: "DB Connection"
                    }
                  }
                  return column;
                }),
              ]}
              disableColumnMenu
              rowHeight={39}
              localeText={{
                noRowsLabel: "No Iris Test Case found",
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              {...(irisTestCases.length < 5 && {
                hideFooterPagination: true,
                hideFooter: true,
              })}
              sx={{
                ".css-1a12hj3-MuiToolbar-root-MuiTablePagination-toolbar": {
                  background: "white !important",
                  color: "black !important",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#d8d8d8",
                  minHeight: "40px !important",
                  maxHeight: "40px !important",
                },
                ".MuiSelect-icon": {
                  color: "black",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
      {nexusTestCases.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary className={classes.accordion} expandIcon={<ExpandMoreIcon />}>
            <Typography fontFamily={"Inter"}>Nexus Test case</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DataGrid
              loading={loading}
              rows={nexusTestCases}
              getRowId={(row) => row.test_case_id}
              columns={[
                ...columns
                .filter((c) => c.dataId !== "target_db")
                .map((column) => {
                  if (column.field === "source_sql") {
                    return {
                      ...column,
                      headerName: "Input to Nexus",
                      description: "Input to Nexus",
                    };
                  }
                  if (column.field === "target_sql") {
                    return {
                      ...column,
                      headerName: "Expected SQL",
                      description: "Expected SQL"
                    }
                  }
                  if (column.dataId === "source_db") {
                    return {
                      ...column,
                      headerName: "Connection ID",
                      description: "Connection ID"
                    }
                  }
                  return column;
                }),
              ]}
              disableColumnMenu
              rowHeight={39}
              localeText={{
                noRowsLabel: "No Nexus Test Case found",
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              {...(nexusTestCases.length < 5 && {
                hideFooterPagination: true,
                hideFooter: true,
              })}
              sx={{
                ".css-1a12hj3-MuiToolbar-root-MuiTablePagination-toolbar": {
                  background: "white !important",
                  color: "black !important",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#d8d8d8",
                  minHeight: "40px !important",
                  maxHeight: "40px !important",
                },
                ".MuiSelect-icon": {
                  color: "black",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
      {loading && (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          Loading...
        </Typography>
      )}

      {!loading && testCases.length === 0 && irisTestCases.length === 0 && nexusTestCases.length === 0 && (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          No Test Cases found for the selected Test Suite.{" "}
        </Typography>
      )}

      <div style={{display: "flex", mt: 4, justifyContent: "center"}}>
        <Button onClick={() => {handleAddTestCase(testSuite)}} variant="contained">Add Test Case</Button>
      </div>
      <SQLViewDialog
        open={openSqlQueryDialog}
        handleClose={handleCloseDialog}
        queryContent={sqlQueryContent}
        title={title}
        showCopy={true}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={(event) => handleMenuItemClick('edit', event)}>
          <Edit fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={(event) => handleMenuItemClick('delete', event)}>
          <Delete fontSize="small" style={{ marginRight: 8 }} />
          Delete
        </MenuItem>

        {selectedRow?.is_multi_step_enabled ? (
          <MenuItem onClick={(event) => handleMenuItemClick('view_multi_step', event)}>
            <Visibility fontSize="small" style={{ marginRight: 8 }} />
            View Test Baselines
          </MenuItem>
        ) : null}
      </Popover>

      <ViewTestBaselineDialog
        open={openBaselineDialog}
        handleClose={() => setOpenBaselineDialog(false)}
        baselineData={baselineData}
      />
    </Paper>
  );
};

export default TestsuiteDetails;
