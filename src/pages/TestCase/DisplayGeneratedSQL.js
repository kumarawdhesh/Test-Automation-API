import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { redirectToLogin } from "../../store/apiSlice";
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { useDispatch } from "react-redux";
import { getDataFromStorage } from "../../utils/utility";
import { FALCON_API, FALCON_ENV } from "../../../environment";

const columns = [
  { field: "test_scenario", headerName: "Test Case Name", width: 180 },
  { field: "source_sql", headerName: "Source SQL", width: 220, editable: false },
  { field: "target_sql", headerName: "Target SQL", width: 220, editable: false },
  // { field: "alias", headerName: "Alias", width: 180 },
  // { field: "transformations", headerName: "Transformations", width: 180 },
  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => params.value,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  }
];

const DisplayGeneratedSQL = ({ 
  generatedSQL, 
  selectedOrgAppDetails, 
  sourceConnectionType, 
  sourceDB, 
  targetConnectionType, 
  targetDB, 
  setSelectedProspectiveTestcases,
  setGeneratedSQL,
}) => {    
  const dispatch = useDispatch();
  const [rows, setRows] = useState(
    (generatedSQL || []).map((row, idx) => ({
      id: idx,
      ...row,
    }))
  );

  useEffect(() => {
    const prevMap = new Map((rows || []).map(r => [r.test_scenario, r]));

    const newRows = (generatedSQL || []).map((row, idx) => {
      const prev = prevMap.get(row.test_scenario) || {};
      return {
        id: idx,
        ...row,
        is_source_sql_validated: prev.is_source_sql_validated ?? row.is_source_sql_validated,
        is_target_sql_validated: prev.is_target_sql_validated ?? row.is_target_sql_validated,
        status: row.status ?? prev.status ?? "Generated",
      };
    });

    setRows(newRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(generatedSQL)]);
  
  const [editDialog, setEditDialog] = useState({ open: false, rowId: null, sourceSQL: "", targetSQL: "" });

  const handleEditClick = (row) => {
    setEditDialog({
      open: true,
      rowId: row.id,
      sourceSQL: row.source_sql,
      targetSQL: row.target_sql,
    });
  };

  const handleEditSave = () => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === editDialog.rowId
          ? { 
              ...row, 
              source_sql: editDialog.sourceSQL, 
              target_sql: editDialog.targetSQL, 
              is_source_sql_validated: false, 
              is_target_sql_validated: false 
            }
          : row
      )
    );
    setGeneratedSQL((prevGeneratedSQL) =>
      prevGeneratedSQL.map((row, idx) =>
        idx === editDialog.rowId
          ? { 
              ...row, 
              source_sql: editDialog.sourceSQL, 
              target_sql: editDialog.targetSQL,
            }
          : row
      )
    );
    setEditDialog({ open: false, rowId: null, sourceSQL: "", targetSQL: "" });
  };

  const handleEditCancel = () => {
    setEditDialog({ open: false, rowId: null, sourceSQL: "", targetSQL: "" });
  };

  const handleValidateClick = async (row) => {
    dispatch(showLoading());

    const envName = FALCON_ENV === ('local' || 'dev' || 'feature') ? 'dev' : 'uat';

    const sourcePayload = {
      function_name: "mdt-validate-sql",
      user_id: sessionStorage.getItem("username"),
      domain_name: selectedOrgAppDetails.orgName,
      sub_domain_name: selectedOrgAppDetails.appName,
      env_name: envName,
      connection_type: sourceConnectionType,
      connection_name: sourceDB,
      sql: row.source_sql,
    };

    const targetPayload = {
      function_name: "mdt-validate-sql",
      user_id: sessionStorage.getItem("username"),
      domain_name: selectedOrgAppDetails.orgName,
      sub_domain_name: selectedOrgAppDetails.appName,
      env_name: envName,
      connection_type: targetConnectionType,
      connection_name: targetDB,
      sql: row.target_sql,
    };

    try {
      const token = getDataFromStorage("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [sourceRes, targetRes] = await Promise.all([
        fetch(`${FALCON_API}/sql-operations`, {
          method: "POST",
          body: JSON.stringify(sourcePayload),
          headers,
        }),
        fetch(`${FALCON_API}/sql-operations`, {
          method: "POST",
          body: JSON.stringify(targetPayload),
          headers,
        }),
      ]);

      if (sourceRes.status === 401 || targetRes.status === 401) {
        dispatch(closeLoading());
        redirectToLogin();
        return;
      }

      const sourceData = await sourceRes.json();
      const targetData = await targetRes.json();

      const bothValid = sourceData.status === 200 && targetData.status === 200;

      setRows(prevRows => prevRows.map(q =>
        q.id === row.id
          ? { ...q, is_source_sql_validated: sourceData.status === 200, is_target_sql_validated: targetData.status === 200 }
          : q
      ));

      dispatch(closeLoading());
      dispatch(
        showSnackbar({
          message: bothValid
            ? "Both SQLs validated successfully"
            : `Validation failed: ${sourceData.errorMessage || sourceData.message || ''} ${targetData.errorMessage || targetData.message || ''}`,
          className: bothValid
            ? "color-success-background width-50"
            : "color-error-background width-50",
        })
      );
    } catch (error) {
      dispatch(closeLoading());
      setRows(prevRows => prevRows.map(q =>
        q.id === row.id
          ? { ...q, is_source_sql_validated: false, is_target_sql_validated: false }
          : q
      ));
      dispatch(
        showSnackbar({
          message: "Error validating SQLs.",
          className: "color-error-background width-50",
        })
      );
      console.error("error from api: ", error);
    }
  };

  // Define action renderer as a callback to avoid recreating on every render
  const renderActions = (row) => (
    <Box>
      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEditClick(row)}>
        Edit SQL
      </Button>
      <Button
        disabled={row.is_source_sql_validated && row.is_target_sql_validated}
        size="small"
        variant="contained"
        color="success"
        onClick={() => handleValidateClick(row)}
      >
        Validate
      </Button>
    </Box>
  );

  // Map rows to include actions and status, but keep the original data intact
  const rowsWithActions = rows.map((row) => ({
    ...row,
    actions: renderActions(row),
    status: row.status ?? "Generated"
  }));

  const checkIsRowSelectable = (row) => {
    if (row.is_source_sql_validated === false || row.is_target_sql_validated === false) {
      return false;
    }
    if (row.status === "Created") {
      return false;
    }
    return true;
  };

  return (
    <>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rowsWithActions}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(selectedRows) => setSelectedProspectiveTestcases([...selectedRows.ids])}
          disableRowSelectionOnClick={true}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          isRowSelectable={(params) => checkIsRowSelectable(params.row)}
        />
      </Box>

      <Dialog open={editDialog.open} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit SQLs</DialogTitle>
        <DialogContent>
          <TextField
            label="Source SQL"
            fullWidth
            multiline
            minRows={2}
            value={editDialog.sourceSQL}
            onChange={(e) => setEditDialog((d) => ({ ...d, sourceSQL: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Target SQL"
            fullWidth
            multiline
            minRows={2}
            value={editDialog.targetSQL}
            onChange={(e) => setEditDialog((d) => ({ ...d, targetSQL: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DisplayGeneratedSQL;