import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CloseIcon,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FALCON_API } from '../../../environment';
import { getDataFromStorage } from '../../utils/utility';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoading, showLoading } from '../../store/appSlice';

const GenerateSQLDialog = ({ 
		open, 
		onClose, 
		testcaseForms, 
		classes,
		getDBDetails,
		getTargetDBDetails 
	}) => {
	const [sourceSchema, setSourceSchema] = useState('');
	const [targetSchema, setTargetSchema] = useState('');
	const [sourceTable, setSourceTable] = useState('');
	const [targetTable, setTargetTable] = useState('');
	const [sourceColumns, setSourceColumns] = useState([]);
	const [targetColumns, setTargetColumns] = useState([]);
	const [sourceTables, setSourceTables] = useState([]);
	const [targetTables, setTargetTables] = useState([]);
	const [sourceSchemas, setSourceSchemas] = useState([]);
	const [targetSchemas, setTargetSchemas] = useState([]);
	const [sourceColumnForMapping, setSourceColumnForMapping] = useState("");
	const [targetColumnForMapping, setTargetColumnForMapping] = useState("");
	const [mappingRows, setMappingRows] = useState([]);

	const { selectedOrgAppDetails } = useSelector((state) => state.data);
	const dispatch = useDispatch();

	useEffect(() => {				
		if(open){
			fetchSourceSchemas();
			fetchTargetSchemas();
		}
	}, [testcaseForms, open]);

	const fetchSourceSchemas = () => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/mdt-get-schema-tables-columns-details`, {
			method: 'POST',
			body: JSON.stringify({
				query_type: 'schemas',
				connection_type: testcaseForms[0]?.sourceConnection,
				connection_name: getDBDetails?.[0]?.find(dbDetail => dbDetail.connection_id === testcaseForms[0]?.sourceDB)?.connection_name,
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env_name: "dev",
				user_id: sessionStorage.getItem("username"),
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
		})
		.then((response) => response.json())
		.then((response) => {			
			if(response.body){
				setSourceSchemas(response.body?.schemas);
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};

	const fetchTargetSchemas = () => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/mdt-get-schema-tables-columns-details`, {
			method: 'POST',
			body: JSON.stringify({
				query_type: 'schemas',
				connection_type: testcaseForms[0]?.targetConnection,
				connection_name: getTargetDBDetails?.[0]?.find(dbDetail => dbDetail.connection_id === testcaseForms[0]?.targetDB)?.connection_name,
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env_name: "dev",
				user_id: sessionStorage.getItem("username"),
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
		})
		.then((response) => response.json())
		.then((response) => {
			if(response.body){
				setTargetSchemas(response.body?.schemas);
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};

	const handleSourceSchemaChange = (event) => {
		setSourceSchema(event.target.value);
		fetchSourceTables(event.target.value);
	};

	const fetchSourceTables = (sourceSchemaArg) => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/mdt-get-schema-tables-columns-details`, {
			method: 'POST',
			body: JSON.stringify({
				query_type: 'tables',
				connection_type: testcaseForms[0]?.sourceConnection,
				connection_name: getDBDetails?.[0]?.find(dbDetail => dbDetail.connection_id === testcaseForms[0]?.sourceDB)?.connection_name,
				schema_name: sourceSchemaArg,
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env_name: "dev",
				user_id: sessionStorage.getItem("username"),
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
		})
		.then((response) => response.json())
		.then((response) => {
			if(response.body && response.body?.tables !== null){
				setSourceTables(response.body.tables);
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};

	const handleTargetSchemaChange = (event) => {
		setTargetSchema(event.target.value);
		fetchTargetTables(event.target.value);
	};

	const fetchTargetTables = (targetSchemaArg) => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/mdt-get-schema-tables-columns-details`, {
		method: 'POST',
		body: JSON.stringify({
			query_type: 'tables',
			connection_type: testcaseForms[0]?.targetConnection,
			connection_name: getTargetDBDetails?.[0]?.find(dbDetail => dbDetail.connection_id === testcaseForms[0]?.targetDB)?.connection_name,
			schema_name: targetSchemaArg,
			domain_name: selectedOrgAppDetails.orgName,
			sub_domain_name: selectedOrgAppDetails.appName,
			env_name: "dev",
			user_id: sessionStorage.getItem("username"),
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getDataFromStorage("token")}`,
		}
		})
		.then((response) => response.json())
		.then((response) => {
			if(response.body){
				setTargetTables(response.body.tables);
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};  
	
	const handleSourceTableChange = (event) => {
		setSourceTable(event.target.value);
		fetchSourceColumns(event.target.value);
	};

	const fetchSourceColumns = (sourceTableArg) => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/mdt-get-schema-tables-columns-details`, {
			method: 'POST',
			body: JSON.stringify({
				query_type: 'columns',
				connection_type: testcaseForms[0]?.sourceConnection,
				connection_name: getDBDetails?.[0]?.find(dbDetail => dbDetail.connection_id === testcaseForms[0]?.sourceDB)?.connection_name,
				schema_name: sourceSchema,
				table_name: sourceTableArg,
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env_name: "dev",	
				user_id:  sessionStorage.getItem("username"),		
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
		})
		.then((response) => response.json())
		.then((response) => {
			if(response.body && response.body?.columns !== null){
				setSourceColumns(response.body.columns);
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};

	const handleTargetTableChange = (event) => {
		setTargetTable(event.target.value);
		fetchTargetColumns(event.target.value);
	};

	const fetchTargetColumns = (targetColumnArg) => {
		dispatch(showLoading());
		fetch(`${FALCON_API}/mdt-get-schema-tables-columns-details`, {
			method: 'POST',
			body: JSON.stringify({
				query_type: 'columns',
				connection_type: testcaseForms[0]?.targetConnection,
				connection_name: getTargetDBDetails?.[0]?.find(dbDetail => dbDetail.connection_id === testcaseForms[0]?.targetDB)?.connection_name,
				schema_name: targetSchema,
				table_name: targetColumnArg,
				domain_name: selectedOrgAppDetails.orgName,
				sub_domain_name: selectedOrgAppDetails.appName,
				env_name: "dev",
				user_id: sessionStorage.getItem("username"),
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getDataFromStorage("token")}`,
			}
		})
		.then((response) => response.json())
		.then((response) => {
			if(response.body){
				if(response.body && response.body?.columns !== null){
					setTargetColumns(response.body.columns);
				}
			}
			dispatch(closeLoading());
		}).catch((error) => {
			console.log(error);
			dispatch(closeLoading());
		});
	};

	const handleSourceColumnsForMapping = (event) => {
		setSourceColumnForMapping(event.target.value);
	}

	const handleTargetColumnsForMapping = (event) => {
		setTargetColumnForMapping(event.target.value);
	}

	const columns = [
		{
			field: 'columnName',
			headerName: 'Column Name',
			width: 150,
		},
	];

	const mappingColumns = [
		{
			field: 'source',
			headerName: 'Source',
			flex: 1,
            minWidth: 150,
		},
		{
			field: '',
			headerName: '',
			flex: 1,
			minWidth: 100,
			align: "center",
			disableColumnMenu: true,
    		sortable: false,
			renderCell: () => {
				return <p style={{textAlign: "center"}}>{`->`}</p>
			}
		},
		{
			field: 'target',
			headerName: 'Target',
			flex: 1,
            minWidth: 150,
		},
	];

	const sourceRows = sourceColumns.map((column, index) => ({
		id: index,
		select: false,
		columnName: column,
	}));

	const targetRows = targetColumns.map((column, index) => ({
		id: index,
		select: false,
		columnName: column,
	}));

	const handleAddMapping = () => {
		if(sourceColumnForMapping !== "" && targetColumnForMapping !== ""){
			setMappingRows([
				...mappingRows,
				{
					id: Date.now(),
					source: sourceColumnForMapping,
					target: targetColumnForMapping,
				}
			]);
			setSourceColumnForMapping("");
			setTargetColumnForMapping("");
		}
	}

	const generateSql = () => {
		console.log("Make Backend call");
		
	}

	return (
		<Dialog maxWidth={"75%"} open={open} onClose={onClose}>
			<DialogTitle>
				<b>Generate SQL</b>
			</DialogTitle>
			<DialogContent>
				<Grid container>
					<Grid item xs={12}>
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							{/* Fields Selection */}
							<Grid container spacing={5}>
								<Grid item xs={12} sm={6}>
									<FormControl variant="standard" sx={{ width: '100%' }}>
										<InputLabel id="source-schema-label">Source Schema</InputLabel>
										<Select
										labelId="source-schema-label"
										id="source-schema-select"
										// multiple
										value={sourceSchema}
										onChange={handleSourceSchemaChange}
										>
										{sourceSchemas.map((schema) => (
											<MenuItem key={schema} value={schema}>
											{schema}
											</MenuItem>
										))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl variant="standard" sx={{ width: '100%' }}>
										<InputLabel id="target-schema-label">Target Schema</InputLabel>
										<Select
										labelId="target-schema-label"
										id="target-schema-select"
										value={targetSchema}
										onChange={handleTargetSchemaChange}
										>
										{targetSchemas.map((schema) => (
											<MenuItem key={schema} value={schema}>
											{schema}
											</MenuItem>
										))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl variant="standard" sx={{ width: '100%' }}>
										<InputLabel id="source-table-label">Source Table</InputLabel>
										<Select
										labelId="source-table-label"
										id="source-table-select"
										value={sourceTable}
										onChange={handleSourceTableChange}
										>
										{sourceTables.map((table) => (
											<MenuItem key={table} value={table}>
											{table}
											</MenuItem>
										))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl variant="standard" sx={{ width: '100%' }}>
										<InputLabel id="target-table-label">Target Table</InputLabel>
										<Select
										labelId="target-table-label"
										id="target-table-select"
										value={targetTable}
										onChange={handleTargetTableChange}
										>
										{targetTables.map((table) => (
											<MenuItem key={table} value={table}>
											{table}
											</MenuItem>
										))}
										</Select>
									</FormControl>
								</Grid>
							</Grid>
							
							{/* Table Section */}
							<Grid container spacing={5} sx={{marginTop: "20px", marginBottom: "20px"}}>
								<Grid item xs={6}>
									<Box sx={{ width: '100%' }}>
										<DataGrid
											rows={sourceRows}
											columns={columns}
											checkboxSelection
											hideFooter
											onSelectionModelChange={(params) => {
												setSelectedSourceRows(params.selectionModel);
											}}
											sx={{ height: 250 }}
										/>
									</Box>
								</Grid>
								<Grid item xs={6}>
									<Box sx={{width: '100%' }}>
										<DataGrid
											rows={targetRows}
											columns={columns}
											checkboxSelection
											hideFooter
											onSelectionModelChange={(params) => {
												setSelectedTargetRows(params.selectionModel);
											}}
											sx={{ height: 250 }}
										/>
									</Box>
								</Grid>
							</Grid>
							
							<h4>Column Mapping</h4>
							{/* Mapping Section */}
							<Grid container spacing={2}>
								<Grid item xs={5.25}>
									<FormControl variant="standard" sx={{ width: '100%' }}>
										<InputLabel id="source-schema-label">Source Column</InputLabel>
										<Select
										labelId="source-schema-label"
										id="source-schema-select"
										value={sourceColumnForMapping}
										onChange={handleSourceColumnsForMapping}
										>
										{sourceColumns.map((col) => (
											<MenuItem key={col} value={col}>
											{col}
											</MenuItem>
										))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={5.25}>
									<FormControl variant="standard" sx={{ width: '100%' }}>
										<InputLabel id="target-schema-label">Target Column</InputLabel>
										<Select
										labelId="target-schema-label"
										id="target-schema-select"
										value={targetColumnForMapping}
										onChange={handleTargetColumnsForMapping}
										>
										{targetColumns.map((col) => (
											<MenuItem key={col} value={col}>
											{col}
											</MenuItem>
										))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={1.5}>
									<Button 
										variant="contained" 
										style={{marginTop: "10px"}} 
										onClick={handleAddMapping}
										className={classes.btn}>
										Add
									</Button>
								</Grid>
							</Grid>
						</Box>
					</Grid>
					<Grid sx={{ marginTop: "20px"}}  item xs={6}>
						<Box display="flex" justifyContent="center" alignItems="center">
							<DataGrid
								rows={mappingRows}
								columns={mappingColumns}
								hideFooter
								onSelectionModelChange={(params) => {
									setSelectedTargetRows(params.selectionModel);
								}}
								sx={{ height: 250 }}
							/>
						</Box>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" onClick={onClose}>Cancel</Button>
				<Button variant="contained" className={classes.btn} onClick={generateSql}>Generate SQL</Button>
			</DialogActions>
		</Dialog>
	)
};

export default GenerateSQLDialog;


