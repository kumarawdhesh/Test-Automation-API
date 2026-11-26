import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { getDataFromStorage } from "../../utils/utility";
import TestCaseQuestionGenerate from './TestCaseQuestionGenerate';
import DataTestingGenerator from './DataTestingGenerator';
import { FALCON_API, GUARDIAN_API } from '../../../environment';
import { useDispatch, useSelector } from 'react-redux';
import { redirectToLogin } from "../../store/apiSlice";
import { closeLoading, showLoading, showSnackbar } from '../../store/appSlice';
import { useGetSchemasForDBMutation, useGetTestSuitMutation } from '../../store/mdtSlice';

const FIELD_WIDTH = 260;
const selectSx = { mb: 2, width: FIELD_WIDTH, minWidth: FIELD_WIDTH, maxWidth: FIELD_WIDTH };

const TestCaseGeneratorParent = () => {
  const dispatch = useDispatch();

  const [mainType, setMainType] = useState('');
  const [testType, setTestType] = useState('');
  
  const [sourceDB, setSourceDB] = useState('');
  const [targetDB, setTargetDB] = useState('');

  const [sourceConnectionType, setSourceConnectionType] = useState('');
  const [targetConnectionType, setTargetConnectionType] = useState('');

  const [sourceSchemaTableMaster, setSourceSchemaTableMaster] = useState([]);
  const [targetSchemaTableMaster, setTargetSchemaTableMaster] = useState([]);

  const [sourceSelectedTables, setSourceSelectedTables] = useState([]);
  const [targetSelectedTables, setTargetSelectedTables] = useState([]);

  const [columnMappings, setColumnMappings] = useState([]);
  const [selectedColumnMappings, setSelectedColumnMappings] = useState([]);
  
  const [connectionMaster, setConnectionMaster] = useState({});
  const [sourceConnectionMaster, setSourceConnectionMaster] = useState([]);
  const [targetConnectionMaster, setTargetConnectionMaster] = useState([]);

  const [sourceColumnMaster, setSourceColumnMaster] = useState({});
  const [targetColumnMaster, setTargetColumnMaster] = useState({});

  const [showTable, setShowTable] = useState(true);

  const [genericTestScenarios, setGenericTestScenarios] = useState([]);
  const [selectedTestScenarios, setSelectedTestScenarios] = useState([]);
  const [keyColumns, setKeyColumns] = useState([]);

  const [generatedSQL, setGeneratedSQL] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [isRequired, setIsRequired] = useState(false);
  const [testSuiteValue, setTestSuiteValue] = useState("");
  const [searchTestSuite, setSearchTestSuite] = useState("");
  const [testSuitInfo, setTestSuitInfo] = useState([]);
  const [testSuiteDialogOpen, setTestSuiteDialogOpen] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState([]);
  const [testSuiteDetailes, setTestSuiteDetailes] = useState([{name: "", description: ""}]);
  const [selectedProspectiveTestcases, setSelectedProspectiveTestcases] = useState([]);

    // Single Table Testing states
  const [singleTableConnectionType, setSingleTableConnectionType] = useState('');
  const [singleTableConnection, setSingleTableConnection] = useState('');
  const [singleTableSchema, setSingleTableSchema] = useState('');
  const [singleTableName, setSingleTableName] = useState('');
  const [singleTableTestMode, setSingleTableTestMode] = useState(''); // 'default' or 'manual'
  const [singleTableTestScenario, setSingleTableTestScenario] = useState('');
  const [singleTableSQL, setSingleTableSQL] = useState('');
  const [singleTableExpectedResult, setSingleTableExpectedResult] = useState(undefined);

  const { selectedOrgAppDetails } = useSelector((state) => state.data); 
  const [ getSchemasForDB ] = useGetSchemasForDBMutation(); 
  const [ getTestSuit ] = useGetTestSuitMutation();

  const createTestsuiteOption = { id: -1, name: "Create Testsuite" };
  const containsText = (text, searchTestSuite) => text.toLowerCase().indexOf(searchTestSuite.toLowerCase()) > -1;

    
  useEffect(() => {
    if (selectedOrgAppDetails && selectedOrgAppDetails.orgName !== "" && selectedOrgAppDetails.appName !== "") {
      fetchConnectionDetails();
      fetchTestSuitInfo();
    }
  }, [selectedOrgAppDetails]);

  useEffect(() => {
    if(sourceSelectedTables.length && targetSelectedTables.length){
      
      if( sourceSelectedTables[0].table === targetSelectedTables[0].table 
        && sourceSelectedTables[0].schema === targetSelectedTables[0].schema 
        && sourceDB === targetDB ) {
          
        dispatch(showSnackbar({
          message: "Source and Target table cannot be the same",
          className: "color-error-background width-50",
        })
      );
      setTargetSelectedTables([]);
      setColumnMappings([]);
      } else {
        // Fetch actual columns based on selected sourceTable and targetTable
        fetchColumnsAndMappings();
      }
    }
  }, [sourceSelectedTables, targetSelectedTables]);

  useEffect(() => {
      const filteredOptions = testSuitInfo.filter((option) => containsText(option?.name, searchTestSuite));
      if (!searchTestSuite) {
          setDisplayedOptions([testSuitInfo.find((option) => option?.name === "Default"), createTestsuiteOption]);
      } else {
          setDisplayedOptions([...filteredOptions, createTestsuiteOption]);
      }
  }, [searchTestSuite, testSuitInfo]);

  const fetchTestSuitInfo = async () => {
      try {
        dispatch(showLoading());
        const { data: response, error } = await getTestSuit({
          function_name: "get-test-suites",
          user_id: sessionStorage.getItem("username"),
          domain_name: selectedOrgAppDetails.orgName,
          sub_domain_name: selectedOrgAppDetails.appName,
        });
  
        if (response && response.body && response.statusCode === 200) {
          setTestSuitInfo(response?.body.test_suites);
          dispatch(closeLoading());
        }
        if (!!error) throw error;
      } catch (error) {
          dispatch(closeLoading());
          console.error("Error fetching Test Suite info:", error);
      }
  };
  
  const fetchConnectionDetails = async () => {
    try {
      const token = getDataFromStorage("token");

      fetch(
        `${GUARDIAN_API}&domainName=${selectedOrgAppDetails.orgName}&subDomainName=${selectedOrgAppDetails.appName}`, 
        {
          method: "GET",
          headers: {
            Authorization: `${token}`,
            IdentityProvider: "aws_cognito"
          },
      }).then((response) => {			
        if (response.status === 401) {
          dispatch(closeLoading());
          // Unauthorized, redirect to login
          redirectToLogin();
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data.statusCode === 200) {
          // setConnectionDetailes(data.connection_name);
          setConnectionMaster(data.connection_name);
        } else {
          // dispatch(
          //   showSnackbar({
          //     message: "Error fetching connection details",
          //     className: "color-error-background width-50",
          //   })
          // );
        }
      }).catch(err => {
        console.log(err);
      });

    } catch (error) {
      console.error("Error fetching connection details:", error);
    }
  };

  const fetchSchemasAndTablesForDB = async (dbName, connectionType, sourceOrTarget) => {
    dispatch(showLoading());
    const { data: response, error } = await getSchemasForDB({
        function_name: "mdt-get-all-schema-tables",
        user_id: sessionStorage.getItem("username"),
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        connection_type: connectionType,
        connection_name: dbName,
    });
    if (error) {
        console.error("Error fetching schemas and tables:", error);
        if (sourceOrTarget === 'source') setSourceSchemaTableMaster([]);
        else  setTargetSchemaTableMaster([]);
        dispatch(closeLoading());
    } else {
        dispatch(closeLoading());
        if(response.statusCode === 200){
          if (sourceOrTarget === 'source') {
            setSourceSchemaTableMaster(response.body || []);
          } else {
            setTargetSchemaTableMaster(response.body || []);
          }
        } else {
          dispatch(
            showSnackbar({
              message: "Error fetching schemas and tables",
              className: "color-error-background width-50",
            })
          );
        }
    }
  };

  // Fetch Columns and Mappings based on sourceSelectedTables and targetSelectedTables
  // Also fetch generic test scenarios
  const fetchColumnsAndMappings = async () => {
    dispatch(showLoading());

    const { data: response, error } = await getSchemasForDB({
        function_name: "mdt-get-schema-tables-columns-details",
        query_type: 'columns',
        user_id: sessionStorage.getItem("username"),
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        source_connection_type: sourceConnectionType,
        source_connection_name: sourceDB,
        source_details: sourceSelectedTables,
        target_connection_type: targetConnectionType,
        target_connection_name: targetDB,
        target_details: targetSelectedTables,
    });

    if (error) {
        console.error("Error fetching columns:", error);
        dispatch(closeLoading());

    } else {
        dispatch(closeLoading());

        if(response.statusCode === 200){
          setSourceColumnMaster(response.body.columns.source_tables || {});
          setTargetColumnMaster(response.body.columns.target_tables || {});
          
          // Combine default_mapping and llm_mapping, remove duplicates
          const defaultMapping = response.body.mappings?.default_mappings || [];
          const llmMapping = response.body.mappings?.llm_mappings || [];
          const variantMapping = response.body.mappings?.variant_mappings || [];

          const combined = [...defaultMapping, ...llmMapping, ...variantMapping];

          // Remove duplicates based on all four fields
          const uniqueMappings = [];
          const seen = new Set();
          for (const map of combined) {
            const key = `${map.sourceColumn}|${map.sourceTable}|${map.targetColumn}|${map.targetTable}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueMappings.push(map);
            }
          }
          setColumnMappings(uniqueMappings);
          let genericTestScenarios = [

          ]
          if (response.body?.data_test_scenarios?.data_test_scenarios?.length) {
            genericTestScenarios = [
              ...genericTestScenarios,
              ...response.body?.data_test_scenarios?.data_test_scenarios,
            ];
          }

          if (response.body?.llm_scenarios?.length) {
            genericTestScenarios = [
              ...genericTestScenarios,
              ...response.body?.llm_scenarios,
            ];
          }

          setGenericTestScenarios(genericTestScenarios || []);
        }
    }
  };

  // Handlers
  const handleMainTypeChange = (event) => {
    const value = event.target.value;
    setMainType(value);
    // if (value === 'iris') {
    //   navigate('/testsuite/question-generate');
    // }
    // Reset all below for Data Testing
    setTestType('');
    setSourceDB('');
    setTargetDB('');
    setSourceConnectionType('');
    setTargetConnectionType('');
    setSourceSchemaTableMaster([]);
    setTargetSchemaTableMaster([]);
    setSourceSelectedTables([]);
    setTargetSelectedTables([]);
    setColumnMappings([]);
    setCurrentStep(0);
  };

  const handleTestTypeChange = (event) => {
    setTestType(event.target.value);
    setSourceDB('');
    setTargetDB('');
    setSourceConnectionType('');
    setTargetConnectionType('');
    setSourceSchemaTableMaster([]);
    setTargetSchemaTableMaster([]);
    setSourceSelectedTables([]);
    setTargetSelectedTables([]);
    setColumnMappings([]);
    setCurrentStep(0);
  };

  const handleSourceDBChange = (event) => {
    setSourceDB(event.target.value);
    // fetchSchemasForDB(event.target.value, sourceConnectionType, 'source');
    fetchSchemasAndTablesForDB(event.target.value, sourceConnectionType, 'source');
    // setSourceSchema('');
    // setSourceTable('');
    setSourceSelectedTables([]);
    setColumnMappings([]);
  };

  const handleTargetDBChange = (event) => {
    setTargetDB(event.target.value);
    // fetchSchemasForDB(event.target.value, targetConnectionType, 'target');
    fetchSchemasAndTablesForDB(event.target.value, targetConnectionType, 'target');
    // setTargetSchema('');
    // setTargetTable('');
    setTargetSelectedTables([]);
    setColumnMappings([]);
  };

  const handleSourceConnectionTypeChange = (event) => {
    setSourceConnectionType(event.target.value);
    setSourceConnectionMaster(
      connectionMaster[event.target.value] || []
    );
    setSourceDB('');
    // setSourceSchema('');
    // setSourceTable('');
    setSourceSelectedTables([]);
    setColumnMappings([]);
  };

  const handleTargetConnectionTypeChange = (event) => {
    setTargetConnectionType(event.target.value);
    setTargetConnectionMaster(
      connectionMaster[event.target.value] || []
    );
    setTargetDB('');
    // setTargetSchema('');
    // setTargetTable('');
    setTargetSelectedTables([]);
    setColumnMappings([]);
  };

  // const handleSourceSchemaChange = (event) => {
  //   setSourceSchema(event.target.value);
  //   fetchTablesForSchema(event.target.value, sourceDB, sourceConnectionType, 'source');
  //   setSourceTable('');
  //   setColumnMappings([]);
  // };

  // const handleTargetSchemaChange = (event) => {
  //   setTargetSchema(event.target.value);
  //   fetchTablesForSchema(event.target.value, targetDB, targetConnectionType, 'target');
  //   setTargetTable('');
  //   setColumnMappings([]);
  // };

  // const handleSourceTableChange = (event) => {
  //   setSourceTable(event.target.value);
  //   // if (targetTable && event.target.value) {
  //   //   setColumnMappings(dummyColumnMappings);
  //   // } else {
  //     setColumnMappings([]);
  //   // }
  // };

  // const handleTargetTableChange = (event) => {
  //   setTargetTable(event.target.value);
  //   // if (sourceTable && event.target.value) {
  //   //   setColumnMappings(dummyColumnMappings);
  //   // } else {
  //     setColumnMappings([]);
  //   // }
  // };
  
  // Proceed to generate SQL
  const handleProceed = async () => {
    dispatch(showLoading());
    const { data: response, error } = await getSchemasForDB({
        function_name: "mdt-data-testing-sql-generation",
        domain_name: selectedOrgAppDetails.orgName,
        sub_domain_name: selectedOrgAppDetails.appName,
        user_id: sessionStorage.getItem("username"),
        source_connection_type: sourceConnectionType,
        source_connection_name: sourceDB,
        target_connection_type: targetConnectionType,
        target_connection_name: targetDB,
        source_details: sourceSelectedTables,
        target_details: targetSelectedTables,
        column_mappings: selectedColumnMappings.map(mapping => ({
          source_column: mapping.sourceColumn,
          source_table: mapping.sourceTable.startsWith('(source)-') ? mapping.sourceTable.replace('(source)-', '') : mapping.sourceTable,
          target_column: mapping.targetColumn,
          target_table: mapping.targetTable.startsWith('(target)-') ? mapping.targetTable.replace('(target)-', '') : mapping.targetTable,
          transformation: mapping.transformation || []
        })),
        test_scenarios: selectedTestScenarios,
        table_relationships: "one-to-one" // Future use
    });

    if (error) {
        console.error("Error Generating SQL:", error);
        dispatch(closeLoading());

    } else {
        dispatch(closeLoading());
        if(response.statusCode === 200){
          
          setGeneratedSQL(response.body.sql_queries || []);
          setCurrentStep(3);
        } else {
          dispatch(
            showSnackbar({
              message: "Error Generating SQL",
              className: "color-error-background width-50",
            })
          );
        }
    }
  };

  const handleTestCaseCreation = () => {
      let testSuiteId = undefined;
      if(typeof testSuiteValue === "number"){
          testSuiteId = testSuiteValue
      } else {
          testSuiteId = {
              test_suite_name: testSuiteValue.name,
              test_suite_description: testSuiteValue.description
          }
      }
      const payload = {
        test_cases: selectedProspectiveTestcases.filter(prospectiveTestcaseId => {
            const testcase = generatedSQL[prospectiveTestcaseId];
            return (testcase.status !== "Created");
          }).map(prospectiveTestcaseId => {
            const testcase = generatedSQL[prospectiveTestcaseId];

            return({
              testSuiteId: testSuiteId,
              testCaseName: testcase.test_scenario,
              testCaseDescription: "",
              testType: "Data_Testing",
              sourceConnection: sourceConnectionType,
              sourceDB: sourceDB,
              targetConnection: targetConnectionType,
              targetDB: targetDB,
              sourceSQL: testcase.source_sql,
              targetSQL: testcase.target_sql,
              keyColumns: keyColumns,
              domain_name: selectedOrgAppDetails.orgName,
              sub_domain_name: selectedOrgAppDetails.appName,
            })
        }),
        user_id: sessionStorage.getItem("username"),
        function_name: "test-case-create"
      }
      dispatch(showLoading());
      fetch(`${FALCON_API}/test-case`, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getDataFromStorage("token")}`,
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
      .then((data) => {                
          if(data.statusCode === 200){
              dispatch(closeLoading());
             
              if(data.total_successfully_created_testcases === selectedProspectiveTestcases.length){
                 dispatch(showSnackbar({
                  message: "AllTestcase created successfully",
                  className: "color-success-background width-50",
                }))

                resetEverything();
              } else {
                dispatch(showSnackbar({
                  message: `${data.total_successfully_created_testcases} Testcase(s) created successfully, ${data.total_failed_testcases.length} failed.`,
                  className: "color-warning-background width-50",
                }))
                setSelectedProspectiveTestcases([]);

                // Mark failed testcases as "Failed" and remaining as "Created"
                const failedNames = new Set(
                  (data.total_failed_testcases || []).map(f => f.test_case_name)
                );

                setGeneratedSQL((prevGenerated) =>
                  (prevGenerated || []).map((testcase) => ({
                    ...testcase,
                    status: failedNames.has(testcase.test_scenario) ? "Failed" : "Created",
                  }))
                );

                // //Remove the created testcases from selection
                // setSelectedProspectiveTestcases((prevSelected) =>
                //   prevSelected.filter((index) => {
                //     const testcase = generatedSQL[index];
                //     return failedNames.has(testcase.test_scenario);
                //   })
                // );

              }
              // total_failed_testcases
              
          } else {
              dispatch(closeLoading());
              dispatch(showSnackbar({
                  message: "Unable to create testcase at the moment, Please try again later.",
                  className: "color-error-background width-50",
              }))
          }
      })
      .catch((error) => {
          console.error("Error creating test case:", error);
          dispatch(closeLoading());
          dispatch(showSnackbar({
              message: "Error creating test case, Please try again later.",
              className: "color-error-background width-50",
          }))
      });
  };

  const resetEverything = () => {
      setMainType('');
      setTestType('');
      setSourceDB('');
      setTargetDB('');
      // setSourceSchema('');
      // setTargetSchema('');
      // setSourceTable('');
      // setTargetTable('');
      setColumnMappings([]);
      setCurrentStep(0);
      setGenericTestScenarios([]);
      setSelectedTestScenarios([]);
      setKeyColumns([]);
      setGeneratedSQL([]);
      setTestSuiteValue("");;
      setSelectedProspectiveTestcases([]);
  };

  const saveTestSuite = () => {
    const newTestsuite = {
        id: testSuitInfo.length + 1,
        name: testSuiteDetailes.name,
        description: testSuiteDetailes.description,
    };

    // Update the testSuitInfo state with the new test suite
    setTestSuitInfo((prevState) => {
        const updatedOptions = [...prevState, newTestsuite];
        return updatedOptions;
    });

    // Set the selected test suite value to the newly created one
    setTestSuiteValue(newTestsuite);

    // Now update displayedOptions to reflect the newly added test suite
    setDisplayedOptions((prevState) => {
        const filteredOptions = prevState.filter(option => option?.name !== "Create Testsuite"); // Remove the 'Create Testsuite' option
        return [...filteredOptions, newTestsuite]; // Add the new test suite to the options
    });

    setTestSuiteDialogOpen(false);
    setTestSuiteDetailes({ name: "", description: "" });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Main Type Selection */}
      <Box sx={{ display: 'flex', mb: 4 }}>
        <FormControl sx={selectSx}>
          <InputLabel size='small' id="main-type-label">Select Type</InputLabel>
          <Select
            size='small'
            labelId="main-type-label"
            label="Select Type"
            value={mainType}
            onChange={handleMainTypeChange}
          >
            <MenuItem value="iris">Iris</MenuItem>
            <MenuItem value="data-testing">Data Testing</MenuItem>
          </Select>
        </FormControl>

        {mainType === 'data-testing' && (
          <FormControl sx={{...selectSx, ml: 2 }}>
            <InputLabel size='small' id="test-type-label">Select Mode</InputLabel>
            <Select
              size='small'
              labelId="test-type-label"
              label="Select Test Type"
              value={testType}
              onChange={handleTestTypeChange}
            >
              <MenuItem value="single-table">Single Table Testing</MenuItem>
              <MenuItem value="source-target-comparison">Source Vs Target Comparison</MenuItem>
            </Select>
          </FormControl>
        )}  
      </Box>

      {/* Iris */}
      {mainType === 'iris' && <TestCaseQuestionGenerate />}

      {/* Data Testing Flow */}
      {mainType === 'data-testing' && (
        <DataTestingGenerator
          testType={testType}
          sourceDB={sourceDB}
          targetDB={targetDB}
          // sourceSchema={sourceSchema}
          // targetSchema={targetSchema}
          // sourceTable={sourceTable}
          // targetTable={targetTable}
          setShowTable={setShowTable}
          showTable={showTable}
          sourceConnectionType={sourceConnectionType}
          targetConnectionType={targetConnectionType}
          columnMappings={columnMappings}
          setColumnMappings={setColumnMappings}
          selectedColumnMappings={selectedColumnMappings}
          setSelectedColumnMappings={setSelectedColumnMappings}
          connectionMaster={connectionMaster}
          sourceConnectionMaster={sourceConnectionMaster}
          targetConnectionMaster={targetConnectionMaster}
          setSourceColumnMaster={setSourceColumnMaster}
          setTargetColumnMaster={setTargetColumnMaster}
          // sourceSchemaMaster={sourceSchemaMaster}
          // targetSchemaMaster={targetSchemaMaster}
          // sourceTableMaster={sourceTableMaster}
          // targetTableMaster={targetTableMaster}
          sourceColumnMaster={sourceColumnMaster}
          targetColumnMaster={targetColumnMaster}
          sourceSelectedTables={sourceSelectedTables}
          setSourceSelectedTables={setSourceSelectedTables}
          targetSelectedTables={targetSelectedTables}
          setTargetSelectedTables={setTargetSelectedTables}
          sourceSchemaTableMaster={sourceSchemaTableMaster}
          targetSchemaTableMaster={targetSchemaTableMaster}
          genericTestScenarios={genericTestScenarios}
          selectedTestScenarios={selectedTestScenarios}
          setSelectedTestScenarios={setSelectedTestScenarios}
          keyColumns={keyColumns}
          setKeyColumns={setKeyColumns}
          generatedSQL={generatedSQL}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          handleSourceDBChange={handleSourceDBChange}
          handleTargetDBChange={handleTargetDBChange}
          handleSourceConnectionTypeChange={handleSourceConnectionTypeChange}
          handleTargetConnectionTypeChange={handleTargetConnectionTypeChange}
          // handleSourceSchemaChange={handleSourceSchemaChange}
          // handleTargetSchemaChange={handleTargetSchemaChange}
          // handleSourceTableChange={handleSourceTableChange}
          // handleTargetTableChange={handleTargetTableChange}
          handleProceed={handleProceed}
          selectedOrgAppDetails={selectedOrgAppDetails}
          isRequired={isRequired}
          testSuiteValue={testSuiteValue}
          testSuitInfo={testSuitInfo}
          testSuiteDialogOpen={testSuiteDialogOpen}
          displayedOptions={displayedOptions}
          testSuiteDetailes={testSuiteDetailes}
          saveTestSuite={saveTestSuite}
          setIsRequired={setIsRequired}
          setTestSuiteValue={setTestSuiteValue}
          setSearchTestSuite={setSearchTestSuite}
          setTestSuiteDialogOpen={setTestSuiteDialogOpen}
          setDisplayedOptions={setDisplayedOptions}
          setTestSuiteDetailes={setTestSuiteDetailes}
          setSelectedProspectiveTestcases={setSelectedProspectiveTestcases}
          selectedProspectiveTestcases={selectedProspectiveTestcases}
          handleTestCaseCreation={handleTestCaseCreation}
          setGeneratedSQL={setGeneratedSQL}
          singleTableConnectionType={singleTableConnectionType}
          setSingleTableConnectionType={setSingleTableConnectionType}
          singleTableConnection={singleTableConnection}
          setSingleTableConnection={setSingleTableConnection}
          singleTableSchema={singleTableSchema}
          setSingleTableSchema={setSingleTableSchema}
          singleTableName={singleTableName}
          setSingleTableName={setSingleTableName}
          singleTableTestMode={singleTableTestMode}
          setSingleTableTestMode={setSingleTableTestMode}
          singleTableTestScenario={singleTableTestScenario}
          setSingleTableTestScenario={setSingleTableTestScenario}
          singleTableSQL={singleTableSQL}
          setSingleTableSQL={setSingleTableSQL}
          singleTableExpectedResult={singleTableExpectedResult}
          setSingleTableExpectedResult={setSingleTableExpectedResult}
        />
      )}
    </Box>
  );
};

export default TestCaseGeneratorParent;
