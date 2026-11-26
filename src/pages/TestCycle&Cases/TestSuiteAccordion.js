import React, {  useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Input,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SQLViewDialog from "../../components/SQLViewDialog/SQLViewDialog";
import * as classes from "./TestCycle&Cases.module.css";
// import { useSelector } from "react-redux";
// import { getDataFromStorage } from "../../utils/utility";
// import { GUARDIAN_API } from "../../../environment";


const TestSuiteAccordion = ({
    data,
    searchQuery,
    selectedTestCasesIds,
    setSelectedTestCasesIds,
  }) => {	
	  // const { selectedOrgAppDetails } = useSelector((state) => state.data);

    const [expandedSuite, setExpandedSuite] = useState(null);
    const [selectedSuites, setSelectedSuites] = useState([]);
    const [openSqlQueryDialog, setOpenSqlQueryDialog] = useState(false);
    const [sqlQueryContent, setSqlQueryContent] = useState("");
    const [title, setTitle] = useState("");
	  // const [irisSourceDBList, setIrisSourceDBList] = useState([]);


    // useEffect(() => {
    //   fetchConnectionTypesAndSetSnowflakeDB()
    // }, [])

	  // const fetchConnectionTypesAndSetSnowflakeDB = async () => {
    // const token = getDataFromStorage("token");

    // fetch(`${GUARDIAN_API}&domainName=${selectedOrgAppDetails.orgName}&subDomainName=${selectedOrgAppDetails.appName}`, {
    //     method: "GET",
    //     headers: {
    //         Authorization: `${token}`,
    //         IdentityProvider: "aws_cognito"
    //     },
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.statusCode === 200) {
    //         for(let type in data.connection_name){
    //           if(type === "Snowflake"){
    //             setIrisSourceDBList(data.connection_name[type])
    //           }
    //         }
    //     }
    // })
    // .catch(error => {
    //     console.error("Error fetching connection details:", error);
    // });
    // }

    const handleChange = (panel) => (event, isExpanded) => {
      setExpandedSuite(isExpanded ? panel : false);
    };
        
    //This handler is for selecting the whole test suite.
    const handleSuiteCheckboxChange = (suiteId) => (event) => {
      const isChecked = event.target.checked;
  
      setSelectedSuites((prevSelectedSuites) =>
        isChecked
          ? [...prevSelectedSuites, suiteId]
          : prevSelectedSuites.filter((id) => id !== suiteId)
      );      
  
      const suite = data.test_suites.find((suite) => suite.id === suiteId);
      
      if (suite) {
        const testCaseIds = suite.test_cases.map((tc) => ({
          test_case_id: tc.test_case_id,
          test_case_name: tc.test_case_name,
          source_connection: tc.source_connection,
          target_connection: tc.target_connection,
          test_suite_name: suite.name,
          execution_engine: tc.execution_engine,
          test_case_type: tc.test_case_type,
          test_suite_id: suite.id,
          source_db: tc.source_db,
          target_db: tc.target_db,
          source_sql: tc.source_sql,
          depends_on: tc.depends_on,
        }));        
        const uniqueTestCaseIds = testCaseIds.filter(
          (tc) => !selectedTestCasesIds.some((selected) => selected.test_case_id === tc.test_case_id)
        );
        
        setSelectedTestCasesIds((prevTestCases) =>
          isChecked
            ? [...prevTestCases, ...uniqueTestCaseIds]
            : prevTestCases.filter(
                (tc) => !testCaseIds.some((t) => t.test_case_id === tc.test_case_id)
              )
        );
      }
  
      setExpandedSuite(suiteId);
    };
  
    const handleTestCaseCheckboxChange = (testCase) => (event) => {
      const isChecked = event.target.checked;      

      setSelectedTestCasesIds((prevSelectedTestCases) =>
        isChecked
          ? [...prevSelectedTestCases, testCase]
          : prevSelectedTestCases.filter((tc) => tc.test_case_id !== testCase.test_case_id)
      );
    };
	
    const filteredTestSuites = (data?.test_suites || [])
		.map((suite) => {
			const filteredTestCases = (suite.test_cases || []).filter((testCase) => {
				const name = testCase.test_case_name?.toLowerCase() || "";
				const desc = testCase.test_case_desc?.toLowerCase() || "";
				const query = searchQuery.toLowerCase();

				return name.includes(query) || desc.includes(query);
			});

			return {
				...suite,
				test_cases: filteredTestCases,
				matchesSearch:
				(suite.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
				filteredTestCases.length > 0,
			};
		})
		.filter((suite) => suite.matchesSearch)
		// .map((obj) => {
		// 	const groupedTestCases = obj.test_cases.reduce((acc, testCase) => {
		// 		const sourceConnection = testCase.source_connection;
		
		// 		acc[sourceConnection] = acc[sourceConnection] || [];
		// 		acc[sourceConnection].push(testCase);
			
		// 			return acc;
		// 	}, {});
		
		// 	return { ...obj, test_cases: groupedTestCases };
		// });	
  
    const handleOpenDialog = (content, title) => {
      setSqlQueryContent(content);
      setTitle(title);
      setOpenSqlQueryDialog(true);
    };

    const handleCloseDialog = () => {
      setOpenSqlQueryDialog(false);
    };

    const columns = [
		{
			field: "select",
			headerName: "",
			width: 60,
			renderCell: (params) => (
			<Checkbox
				size="small"
				checked={selectedTestCasesIds.some((tc) => tc.test_case_id === params.row.test_case_id)}
				onChange={handleTestCaseCheckboxChange(params.row)}
			/>
			),
		},
		{
			field: "test_case_id",
			headerName: "Test Case Id",
			flex: 1.8,
			headerAlign: "center",
			align: "center",
		},
		{
			field: "test_case_name",
			headerName: "Test Case Name",
			flex: 1.8,
			headerAlign: "left",
			align: "left",
		},
		{
			field: "source_sql",
			headerName: "Source Sql",
			flex: 1.8,
			headerAlign: "center",
			align: "center",
			renderCell: (params) => {
			const { value } = params;
			const query = value;
			return (
				<div style={{ display: "flex", alignItems: "center" }}>
				<Tooltip
					title={
					!openSqlQueryDialog && (
						<Typography
						style={{ cursor: "pointer", fontSize: "12px" }}
						onClick={() => handleOpenDialog(params.row.source_sql, "SQL Query")}
						variant="h6"
						>
						{"view more"}
						</Typography>
					)
					}
					placement="top"
					arrow
				>
					<span
					style={{
						maxWidth: "86px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
					>
					{query}
					</span>
				</Tooltip>
				</div>
			);
			},
		},
		{
			field: "target_sql",
			headerName: "Target Sql",
			flex: 1.8,
			headerAlign: "center",
			align: "center",
			renderCell: (params) => {
			const { value } = params;
			const query = value;
			return (
				<div style={{ display: "flex", alignItems: "center" }}>
				<Tooltip
					title={
					!openSqlQueryDialog && (
						<Typography
						style={{ cursor: "pointer", fontSize: "12px" }}
						onClick={() => handleOpenDialog(params.row.target_sql, "Target Query")}
						variant="h6"
						>
						{"view more"}
						</Typography>
					)
					}
					placement="top"
					arrow
				>
					<span
					style={{
						maxWidth: "86px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
					>
					{query}
					</span>
				</Tooltip>
				</div>
			);
			},
		},
    {
      field: "depends_on",
      headerName: "Depends On",
      flex: 1.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        params.value && params.value.length > 0 ? params.value.join(", ") : "None"
      ),
    },
    {
			field: "tc_modify_reason",
			headerName: "Modification Reason",
			flex: 1.8,
			headerAlign: "center",
			align: "center"
		},
    ];

    return (
      <>
        <Box sx={{ display: "flex", width: "100%", mb: 1, textAlign: "center", backgroundColor: "#b2b2b2" }}>
          <Box sx={{ width: "16.66%" }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#334155",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                padding: "8px 0",
              }}
              noWrap
            >
              Actions
            </Typography>
          </Box>
          <Box sx={{ width: "25%" }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#334155",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                padding: "8px 0",
              }}
              noWrap
            >
              Test Suite ID
            </Typography>
          </Box>
          <Box sx={{ width: "25%" }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#334155",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                padding: "8px 0",
              }}
              noWrap
            >
              Test Suite Name
            </Typography>
          </Box>
          <Box sx={{ width: "25%" }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#334155",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                padding: "8px 0",
              }}
              noWrap
            >
              Test Suite Description
            </Typography>
          </Box>
        </Box>
        {filteredTestSuites?.map((testSuite) => (
          <Accordion
            key={testSuite.id}
            expanded={expandedSuite === testSuite.id}
            onChange={handleChange(testSuite.id)}
            sx={{
              border: "1px solid #e0e0e0",
              boxShadow: "none",
              marginY: "10px",
              backgroundColor: testSuite.id % 2 === 0 ? "#f2f2f2" : "",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              style={{ justifyContent: "space-between", height: "47px", minHeight: 0 }}
            >
              <Box sx={{ display: "flex", width: "100%", textAlign: "center" }}>
                <Box sx={{ width: "16.66%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedSuites.includes(testSuite.id)}
                    onChange={handleSuiteCheckboxChange(testSuite.id)}
                    style={{ width: "15px", height: "16px" }}
                  />
                </Box>
                <Box sx={{ width: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Typography variant="body2" align="center" noWrap>
                    {testSuite.id}
                  </Typography>
                </Box>
                <Box sx={{ width: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Typography variant="body2" align="center" noWrap>
                    {testSuite.name}
                  </Typography>
                </Box>
                <Box sx={{ width: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    align="center"
                    noWrap
                  >
                    {testSuite.description}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails className={classes["accordion__content"]}>
              <Box style={{ height: "auto", width: "100%" }}>
                <DataGrid
                  rows={testSuite.test_cases.map(tc => ({...tc, test_suite_name: testSuite.name, test_suite_id: testSuite.id})) || []}
                  rowHeight={35}
                  columns={columns}
                  getRowId={(row) => row.test_case_id}
                  pageSizeOptions={[5, 10, 25, 50]} // <-- Use pageSizeOptions for MUI X v6+
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5, page: 0 } }
                  }}
                  pagination
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#d8d8d8",
                      minHeight: "40px !important",
                      maxHeight: "40px !important",
                    },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
        <SQLViewDialog
          open={openSqlQueryDialog}
          handleClose={handleCloseDialog}
          queryContent={sqlQueryContent}
          title={title}
          showCopy={true}
        />
      </>
    );
};
  

export default TestSuiteAccordion;


// const GetIrisfields = ({irisSourceDBList}) => {
// 	const [irisVersion, setIrisVersion] = useState("");
//     const [irisSourceDB, setIrisSourceDB] = useState("")

// 	return <>
// 		<Grid container spacing={2}>
// 			<Grid item xs={4}>
// 				<FormControl variant="standard" className={classes.formControl}>
// 					<InputLabel>Iris Version</InputLabel>
// 					<Select 
// 						variant="standard" 
// 						fullWidth 
// 						name="iris_version" 
// 						value={irisVersion} 
// 						onChange={(e) => {setIrisVersion(e.target.value)}}>
// 						<MenuItem value={"Iris"}>Iris</MenuItem>
// 						<MenuItem value={"Iris_kgv"}>Iris_kgv</MenuItem>
// 						<MenuItem value={"Iris_UAT"}>Iris_UAT</MenuItem>
// 						<MenuItem value={"Iris_PROD"}>Iris_PROD</MenuItem>
// 					</Select>
// 				</FormControl>
// 			</Grid>
// 			<Grid item xs={4}>
// 				<FormControl variant="standard" className={classes.formControl}>
// 					<InputLabel>Select DataBase Connection</InputLabel>
// 					<Select
// 						variant="standard"
// 						fullWidth
// 						name="sourceDB"
// 						value={irisSourceDB}
// 						onChange={(e) => {setIrisSourceDB(e.target.value)}}
// 						MenuProps={{
// 						PaperProps: {
// 							style: {
// 							maxHeight: 150,
// 							overflowY: "auto",
// 							},
// 						},
// 						}}
// 					>
// 						{irisSourceDBList?.map((conn) => (
// 							<MenuItem key={conn.connection_id} value={conn.connection_id}>
// 								{conn.connection_name}
// 							</MenuItem>
// 						))}
// 					</Select>
// 				</FormControl>
// 			</Grid>
// 		</Grid>
// 	</> 
// }

// const GetNonIrisFields = ({
// 	testSuiteId, 
// 	connectionTypes, 
// 	sourceConnection, 
// 	targetConnection, 
// 	getConnectionDetails,
// 	dynamicValues,
// 	setDynamicValues,
// }) => {
// 	const [sourceDBList, setSourceDBList] = useState([]);
// 	const [targetDBList, setTargetDBList] = useState([]);


// 	const getSourceAndTargetDB = async (connection, conTypes, setter) => {
// 		const connectionTypeId = conTypes.find(ct => ct.connection_type_name === connection)?.connection_type_id;

// 		const { data: response } = await getConnectionDetails({
// 			type: "connections",
// 			connection_type_id: connectionTypeId,
// 		});
// 		setter(response?.body?.connections)
// 	}

// 	useEffect(() => {
// 		if(connectionTypes){
// 			getSourceAndTargetDB(sourceConnection, connectionTypes, setSourceDBList)
// 			getSourceAndTargetDB(targetConnection, connectionTypes, setTargetDBList)
// 		}
// 	}, [connectionTypes, sourceConnection, targetConnection])
	
// 	return <>
// 		<Grid container spacing={2}>
// 			<Grid item xs={3}>
// 				<FormControl variant="standard" className={classes.formControl}>
// 					<InputLabel>Source Connection Type</InputLabel>
// 					<Input 
// 						InputLabelProps={{
// 							shrink: true,
// 						}}
// 						value={sourceConnection}
// 						readOnly/>
// 				</FormControl>
// 			</Grid>

// 			<Grid item xs={3}>
// 				<FormControl variant="standard" className={classes.formControl}>
// 					<InputLabel>Source Connection</InputLabel>
// 					<Select
// 						name="sourceDB"
// 						onChange={(e) => {
// 							setDynamicValues([{
// 								...dynamicValues,
// 								[testSuiteId]: [{
// 									...dynamicValues[testSuiteId],
// 									[sourceConnection]: [{
// 										...dynamicValues[testSuiteId]?.[sourceConnection],
// 										sourceDB: e.target.value
// 									}]
// 								}]
// 							}])
// 						}}
// 						MenuProps={{
// 							PaperProps: {
// 							style: {
// 								maxHeight: 150,
// 								overflowY: "auto",
// 							},
// 						},
// 					}}
// 					>
// 					{sourceDBList?.map((conn) => (
// 						<MenuItem key={conn.connection_id} value={conn.connection_id}>
// 						{conn.connection_name}
// 						</MenuItem>
// 					))}
// 					</Select>
// 				</FormControl>
// 			</Grid>

// 			<Grid item xs={3}>
// 				<FormControl variant="standard" className={classes.formControl}>
// 					<InputLabel>Target Connection Type</InputLabel>
// 					<Input 
// 						InputLabelProps={{
// 							shrink: true,
// 						}}
// 						value={targetConnection}
// 						readOnly/>
// 				</FormControl>
// 			</Grid>

// 			<Grid item xs={3}>
// 				<FormControl variant="standard" className={classes.formControl}>
// 					<InputLabel>Target Connection</InputLabel>
// 					<Select
// 						name="targetDB"
// 						onChange={(e) => {
// 							setDynamicValues([{
// 								...dynamicValues,
// 								[testSuiteId]: [{
// 									...dynamicValues[testSuiteId],
// 									[sourceConnection]: [{
// 										...dynamicValues[testSuiteId]?.[sourceConnection],
// 										targetDB: e.target.value
// 									}]
// 								}]
// 							}])
// 						}}
// 						MenuProps={{
// 							PaperProps: {
// 							style: {
// 								maxHeight: 150,
// 								overflowY: "auto",
// 							},
// 						},
// 					}}
// 					>
// 					{targetDBList?.map((conn) => (
// 						<MenuItem key={conn.connection_id} value={conn.connection_id}>
// 						{conn.connection_name}
// 						</MenuItem>
// 					))}
// 					</Select>
// 				</FormControl>
// 			</Grid>
// 		</Grid>

// 	</>
// }
