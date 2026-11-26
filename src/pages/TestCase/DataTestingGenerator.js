import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  TextField,
  Checkbox,
  ListSubheader,
  InputAdornment,
  FormControlLabel,
  Switch,
  IconButton,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  RadioGroup,
  Radio,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';
import ColumnMappingRedesign from './ColumnMappingRedesign';
import DisplayGeneratedSQL from './DisplayGeneratedSQL';
import TestSuiteDialog from '../../components/TestSuiteDialog/TestSuiteDialog';
import { Edit, Search, ArrowForward, Delete } from '@mui/icons-material';
import { Stack } from '@mui/system';
import styled from '@emotion/styled';
import { useEffect, useState, useRef } from 'react';

const selectSx = { mb: 2, width: '100%' };

const DataTestingGenerator = ({
  testType,
  sourceDB,
  targetDB,
  sourceConnectionType,
  targetConnectionType,
  columnMappings,
  setColumnMappings,
  connectionMaster,
  sourceConnectionMaster,
  targetConnectionMaster,
  setSourceConnectionMaster,
  setTargetConnectionMaster,
  selectedColumnMappings,
  setSelectedColumnMappings,
  sourceColumnMaster,
  targetColumnMaster,
  sourceSchemaTableMaster,
  targetSchemaTableMaster,
  sourceSelectedTables,
  setSourceSelectedTables,
  targetSelectedTables,
  setTargetSelectedTables,
  genericTestScenarios,
  selectedTestScenarios,
  setSelectedTestScenarios,
  keyColumns,
  setKeyColumns,
  generatedSQL,
  currentStep,
  setCurrentStep,
  handleSourceDBChange,
  handleTargetDBChange,
  handleSourceConnectionTypeChange,
  handleTargetConnectionTypeChange,
  handleProceed,
  selectedOrgAppDetails,
  isRequired,
  testSuiteValue,
  testSuitInfo,
  testSuiteDialogOpen,
  displayedOptions,
  testSuiteDetailes,
  setTestSuiteDetailes,
  setIsRequired,
  setSearchTestSuite,
  setTestSuiteDialogOpen,
  setTestSuiteValue,
  saveTestSuite,
  setSelectedProspectiveTestcases,
  selectedProspectiveTestcases,
  handleTestCaseCreation,
  setGeneratedSQL,
  singleTableConnectionType,
  setSingleTableConnectionType,
  singleTableConnection,
  setSingleTableConnection,
  singleTableSchema,
  setSingleTableSchema,
  singleTableName,
  setSingleTableName,
  singleTableTestMode,
  setSingleTableTestMode,
  singleTableTestScenario,
  setSingleTableTestScenario,
  singleTableSQL,
  setSingleTableSQL,
  singleTableExpectedResult,
  setSingleTableExpectedResult
}) => {
  const mappingRef = useRef(null);
  const [showKeyColumnSelection, setShowKeyColumnSelection] = useState(false);
  const [selectedSourceSchema, setSelectedSourceSchema] = useState(null);
  const [selectedTargetSchema, setSelectedTargetSchema] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [transformationInput, setTransformationInput] = useState('');
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [addMappingDialogOpen, setAddMappingDialogOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({
    sourceTable: '',
    sourceColumn: '',
    targetTable: '',
    targetColumn: '',
  });

  const [cloneSourceColumnMaster, setCloneSourceColumnMaster] = useState({});
  const [cloneTargetColumnMaster, setCloneTargetColumnMaster] = useState({});

  const reviewSqlRef = useRef(null);

  useEffect(() => {
    // If any of the selectedTestScenarios in the genericTestScenarios has the key "category" with value "data_validation" then setting showKeyColumnSelection to true
    const shouldShowKeyColumns = selectedTestScenarios.some(selectedScenario => {
      const scenario = genericTestScenarios.find(scenario => scenario.scenario_name === selectedScenario);
      return scenario && scenario.category === 'data_validation';
    });
    setShowKeyColumnSelection(shouldShowKeyColumns);
  }, [selectedTestScenarios]);

  const steps = ['Select Connections', 'Map Columns', 'Preview', 'Review SQL'];

  const getConnectionTypesMenu = (connections) => {
    if (!connections || Object.keys(connections).length === 0) return null;
    return Object.keys(connections).map((type) => (
      <MenuItem key={type} value={type}>{type}</MenuItem>
    ));
  };

  const getSingleTableConnections = () => {
    if (!singleTableConnectionType) return [];
    return connectionMaster[singleTableConnectionType] || [];
  };

  const getSingleTableSchemas = () => {
    if (!singleTableConnection) return [];
    // Assuming sourceSchemaTableMaster structure, adjust based on your actual data structure
    return sourceSchemaTableMaster || [];
  };

  const getSingleTableTables = () => {
    if (!singleTableSchema) return [];
    const schemaData = getSingleTableSchemas().find(s => s.schema === singleTableSchema);
    return schemaData?.tables || [];
  };

  // scroll to mapping section when column metadata arrives and mapping is visible
  useEffect(() => {
    const sourceTables = Object.keys(sourceColumnMaster || {});
    const targetTables = Object.keys(targetColumnMaster || {});

    const hasSourceCols = sourceColumnMaster && sourceTables.length > 0;
    const hasTargetCols = targetColumnMaster && targetTables.length > 0;

    const mappingVisible = sourceSelectedTables.length > 0 && targetSelectedTables.length > 0;
    if (hasSourceCols && hasTargetCols && mappingVisible && mappingRef.current) {
      // compute target Y so element sits 50px below top of viewport
      const rect = mappingRef.current.getBoundingClientRect();
      const startY = window.scrollY || window.pageYOffset;
      const targetY = Math.max(0, startY + rect.top - 100); // leave 50px gap from top

      // smooth, slower scroll using requestAnimationFrame
      const duration = 900; // milliseconds (increase to slow further)
      const startTime = performance.now();
      const distance = targetY - startY;

      const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      const step = (now) => {
        const elapsed = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutQuad(elapsed);
        window.scrollTo(0, Math.round(startY + distance * eased));
        if (elapsed < 1) {
          requestAnimationFrame(step);
        }
      };

      // small delay to ensure the mapping section has rendered/layouted
      requestAnimationFrame(() => requestAnimationFrame(step));
      if(sourceTables[0] === targetTables[0]) {
        setCloneSourceColumnMaster({ ["(source)-"+sourceTables[0]]: sourceColumnMaster[sourceTables[0]]});
        setCloneTargetColumnMaster({ ["(target)-"+targetTables[0]]: targetColumnMaster[targetTables[0]]});

      } else {
        setCloneSourceColumnMaster(sourceColumnMaster);
        setCloneTargetColumnMaster(targetColumnMaster);

      }
    }
  }, [sourceColumnMaster, targetColumnMaster, sourceSelectedTables, targetSelectedTables]);

  // scroll to Review SQL section when generatedSQL arrives
  useEffect(() => {
    if (generatedSQL && generatedSQL.length > 0 && reviewSqlRef.current) {
      reviewSqlRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedSQL]);

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setTransformationInput(columnMappings[index].transformation || '');
    setEditDialogOpen(true);
  };

  const handleSaveTransformation = () => {
    const updated = columnMappings.map((mapping, idx) => 
      idx === editingIndex 
        ? { ...mapping, transformation: [transformationInput] }
        : mapping
    );
    setColumnMappings(updated);
    
    // Update selectedColumnMappings to reflect the new mapping object
    setSelectedColumnMappings(selectedColumnMappings.map((selected, idx) => 
      JSON.stringify(selected) === JSON.stringify(columnMappings[editingIndex])
        ? updated[editingIndex]
        : selected
    ));
    
    setEditDialogOpen(false);
    setEditingIndex(null);
    setTransformationInput('');
  };

  const handleDeleteMapping = (index) => {
    const mappingToDelete = columnMappings[index];
    
    // Remove from columnMappings
    const updatedMappings = columnMappings.filter((_, idx) => idx !== index);
    setColumnMappings(updatedMappings);
    
    // Remove from selectedColumnMappings if it exists
    setSelectedColumnMappings(
      selectedColumnMappings.filter((selected) => 
        JSON.stringify(selected) !== JSON.stringify(mappingToDelete)
      )
    );
  };

  const handleAddMappingDialogOpen = () => {
    setNewMapping({
      sourceTable: '',
      sourceColumn: '',
      targetTable: '',
      targetColumn: '',
    });
    setAddMappingDialogOpen(true);
  };

  const handleAddMappingDialogClose = () => {
    setAddMappingDialogOpen(false);
  };

  const handleAddMapping = () => {
    const newMappingObject = {
      sourceTable: newMapping.sourceTable,
      sourceColumn: newMapping.sourceColumn,
      targetTable: newMapping.targetTable,
      targetColumn: newMapping.targetColumn,
      transformation: [], // Default to empty transformation
    };

    setColumnMappings([...columnMappings, newMappingObject]);
    setSelectedColumnMappings([...selectedColumnMappings, newMappingObject]);
    // Reset the form
    setNewMapping({
      sourceTable: '',
      sourceColumn: '',
      targetTable: '',
      targetColumn: '',
    });
    setAddMappingDialogOpen(false);
  };
  
  return (
    <>
      {/* Single Table Testing */}
      {testType === 'single-table' && (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>

          {/* Connection Type Selection */}
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ ...selectSx, width: '300px' }}>
              <InputLabel>Connection Type</InputLabel>
              <Select
                label="Connection Type"
                value={singleTableConnectionType}
                onChange={(e) => {
                  setSingleTableConnectionType(e.target.value);
                  setSingleTableConnection('');
                  setSingleTableSchema('');
                  setSingleTableName('');
                }}
              >
                {getConnectionTypesMenu(connectionMaster)}
              </Select>
            </FormControl>
          </Box>

          {/* Connection Selection */}
          {singleTableConnectionType && (
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ ...selectSx, width: '300px' }}>
                <InputLabel>Connection</InputLabel>
                <Select
                  label="Connection"
                  value={singleTableConnection}
                  onChange={(e) => {
                    setSingleTableConnection(e.target.value);
                    setSingleTableSchema('');
                    setSingleTableName('');
                  }}
                >
                  {getSingleTableConnections().map((conn) => (
                    <MenuItem key={conn.connectionId || conn.id} value={conn.connectionName || conn.name}>
                      {conn.connectionName || conn.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Schema Selection */}
          {singleTableConnection && (
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ ...selectSx, width: '300px' }}>
                <InputLabel>Schema</InputLabel>
                <Select
                  label="Schema"
                  value={singleTableSchema}
                  onChange={(e) => {
                    setSingleTableSchema(e.target.value);
                    setSingleTableName('');
                  }}
                >
                  {getSingleTableSchemas().map((schema) => (
                    <MenuItem key={schema.schema} value={schema.schema}>
                      {schema.schema}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Table Selection */}
          {singleTableSchema && (
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ ...selectSx, width: '300px' }}>
                <InputLabel>Table</InputLabel>
                <Select
                  label="Table"
                  value={singleTableName}
                  onChange={(e) => {
                    setSingleTableName(e.target.value);
                    // Reset test mode and related fields when table changes
                    setSingleTableTestMode('');
                    setSingleTableTestScenario('');
                    setSingleTableSQL('');
                    setSingleTableExpectedResult('');
                  }}
                >
                  {getSingleTableTables().map((table) => (
                    <MenuItem key={table.name} value={table.name}>
                      {table.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Test Mode Selection - Radio Buttons */}
          {singleTableName && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Test Mode
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={singleTableTestMode}
                  onChange={(e) => {
                    setSingleTableTestMode(e.target.value);
                    // Reset mode-specific fields
                    setSingleTableTestScenario('');
                    setSingleTableSQL('');
                    setSingleTableExpectedResult('');
                  }}
                >
                  <FormControlLabel
                    value="default"
                    control={<Radio />}
                    label="Default"
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label="Manual"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* Default Mode - Test Scenario Selection */}
          {singleTableTestMode === 'default' && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'blue.50', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Test Scenario
              </Typography>
              <FormControl sx={{ width: '300px' }}>
                <InputLabel>Select Test Scenario</InputLabel>
                <Select
                  label="Select Test Scenario"
                  value={singleTableTestScenario}
                  onChange={(e) => setSingleTableTestScenario(e.target.value)}
                >
                  {genericTestScenarios && genericTestScenarios.map((scenario) => (
                    <MenuItem key={scenario.scenario_name} value={scenario.scenario_name}>
                      {scenario.scenario_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Manual Mode - SQL and Expected Result */}
          {singleTableTestMode === 'manual' && (
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, backgroundColor: 'orange.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  SQL Query
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Enter SQL Query"
                  value={singleTableSQL}
                  onChange={(e) => setSingleTableSQL(e.target.value)}
                  placeholder="SELECT * FROM table_name WHERE ..."
                  variant="outlined"
                />
              </Box>

              <Box sx={{ p: 2, backgroundColor: 'orange.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Expected Result
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Enter Expected Result"
                  value={singleTableExpectedResult}
                  onChange={(e) => setSingleTableExpectedResult(e.target.value)}
                  placeholder="Describe the expected result or paste expected data..."
                  variant="outlined"
                />
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          {singleTableName && singleTableTestMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSingleTableConnectionType('');
                  setSingleTableConnection('');
                  setSingleTableSchema('');
                  setSingleTableName('');
                  setSingleTableTestMode('');
                  setSingleTableTestScenario('');
                  setSingleTableSQL('');
                  setSingleTableExpectedResult('');
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                disabled={
                  singleTableTestMode === 'default'
                    ? !singleTableTestScenario
                    : !singleTableSQL || !singleTableExpectedResult
                }
              >
                Proceed
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {/* Source & Target Comparison */}
      {testType === 'source-target-comparison' && (
        <>
          {/* Data Preparation Section */}
          <Box sx={{
            display: 'flex',
            mt: 2,
            mb: 2,
            overflow: 'hidden',
            height: '400px', // Fixed height for scrollable area
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {/* Left Pane: Source Selection */}
            <Box sx={{
              width: '20%',
              pr: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
              overflowY: 'auto',
              p: 2,
              backgroundColor: (theme) => theme.palette.background.paper
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>Source</Typography>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel size='small' id="source-connection-type-label">Connection Type</InputLabel>
                <Select
                  size='small'
                  labelId="source-connection-type-label"
                  label="Connection Type"
                  value={sourceConnectionType}
                  onChange={handleSourceConnectionTypeChange}
                >
                  {getConnectionTypesMenu(connectionMaster)}
                </Select>
              </FormControl>
              {sourceConnectionType && (
                <Box sx={{ mb: 2 }}>
                  <FormControl sx={{ mb: 2, width: '100%' }}>
                    <InputLabel size='small' id="source-db-label">Source Connection</InputLabel>
                    <Select
                      size='small'
                      labelId="source-db-label"
                      label="Source Connection"
                      value={sourceDB}
                      onChange={handleSourceDBChange}
                    >
                      {sourceConnectionMaster.map((conn) => (
                        <MenuItem key={conn.connectionId} value={conn.connectionName}>
                          {conn.connectionName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <List dense>
                    {
                      sourceDB && <>
                        {sourceSchemaTableMaster.length ? (
                          sourceSchemaTableMaster.map((schemaData) => (
                            <ListItem
                              key={schemaData.schema}
                              sx={{ py: 0.5, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                              onClick={() => {
                                setSelectedSourceSchema(schemaData.schema);
                                // setSelectedType('source');
                              }}
                            >
                              <ListItemText primary={schemaData.schema} primaryTypographyProps={{ variant: 'body2' }} />
                            </ListItem>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No schemas available</Typography>
                        )}
                      </>
                    }
                  </List>
                </Box>
              )}
            </Box>
    
            {/* Center Pane: Tables List */}
            <Box sx={{
              width: '60%',
              pl: 1,
              pr: 1,
              p: 1,
              display: 'flex',
              gap: 1,
              borderRight: '1px solid',
              borderColor: 'divider'
            }}>
              {selectedSourceSchema && (
                <Box sx={{ width: '50%', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>Tables in {selectedSourceSchema}</Typography>
                  <Box sx={{ height: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <List dense sx={{ backgroundColor: 'grey.100' }}>
                      {sourceSchemaTableMaster.find(s => s.schema === selectedSourceSchema)?.tables.map(table => (
                        <ListItem key={table.name} sx={{ py: 0, '&:hover': { backgroundColor: 'action.hover' } }}>
                          <Checkbox
                            checked={sourceSelectedTables.some(t => t.table === table.name && t.schema === selectedSourceSchema)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSourceSelectedTables([{ table: table.name, schema: selectedSourceSchema }]);
                              } else {
                                setSourceSelectedTables([]);
                              }
                            }}
                          />
                          <ListItemText primary={table.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
              {selectedTargetSchema && (
                <Box sx={{ width: '50%', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>Tables in {selectedTargetSchema}</Typography>
                  <Box sx={{ height: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <List dense sx={{ backgroundColor: 'grey.100' }}>
                      {targetSchemaTableMaster.find(s => s.schema === selectedTargetSchema)?.tables.map(table => (
                        <ListItem key={table.name} sx={{ py: 0, '&:hover': { backgroundColor: 'action.hover' } }}>
                          <Checkbox
                            checked={targetSelectedTables.some(t => t.table === table.name && t.schema === selectedTargetSchema)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTargetSelectedTables([{ table: table.name, schema: selectedTargetSchema }]);
                              } else {
                                setTargetSelectedTables([]);
                              }
                            }}
                          />
                          <ListItemText primary={table.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </Box>
    
            {/* Right Pane: Target Selection */}
            <Box sx={{
              width: '20%',
              pl: 2,
              overflowY: 'auto',
              p: 2,
              backgroundColor: (theme) => theme.palette.background.paper
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>Target</Typography>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel size='small' id="target-connection-type-label">Connection Type</InputLabel>
                <Select
                  labelId="target-connection-type-label"
                  label="Connection Type"
                  value={targetConnectionType}
                  onChange={handleTargetConnectionTypeChange}
                  size='small'
                >
                  {getConnectionTypesMenu(connectionMaster)}
                </Select>
              </FormControl>
              {targetConnectionType && (
                <Box sx={{ mb: 2 }}>
                  <FormControl sx={{ mb: 2, width: '100%' }}>
                    <InputLabel size='small' id="target-db-label">Target Connection</InputLabel>
                    <Select
                      size='small'
                      labelId="target-db-label"
                      label="Target Connection"
                      value={targetDB}
                      onChange={handleTargetDBChange}
                    >
                      {targetConnectionMaster.map((conn) => (
                        <MenuItem key={conn.connectionId} value={conn.connectionName}>
                          {conn.connectionName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <List dense>
                    {
                      targetDB && <>
                        {targetSchemaTableMaster.length ? (
                          targetSchemaTableMaster.map((schemaData) => (
                            <ListItem
                              key={schemaData.schema}
                              sx={{ py: 0.5, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                              onClick={() => {
                                setSelectedTargetSchema(schemaData.schema);
                                // setSelectedType('target');
                              }}
                            >
                              <ListItemText primary={schemaData.schema} primaryTypographyProps={{ variant: 'body2' }} />
                            </ListItem>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No schemas available</Typography>
                        )}
                      </>
                    }
                  </List>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Preview Section */}
          {sourceSelectedTables.length > 0 && targetSelectedTables.length > 0 && columnMappings.length > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Preview LLM Generated Column Mappings
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setAddMappingDialogOpen(true)}
                >
                  + Add Mapping
                </Button>
              </Box>

              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 'auto' }}>
                <DataGrid
                  rows={columnMappings.map((mapping, index) => ({ 
                    id: index, 
                    ...mapping, 
                    alias: mapping.sourceColumn,
                    sourceTable: mapping.sourceTable.startsWith('(source)-') ? mapping.sourceTable.replace('(source)-', '') : mapping.sourceTable,
                    targetTable: mapping.targetTable.startsWith('(target)-') ? mapping.targetTable.replace('(target)-', '') : mapping.targetTable, 

                  }))}
                  columns={[
                    { 
                      field: 'select', 
                      headerName: 'Select',
                      width: 60,
                      sortable: false,
                      filterable: false,
                      disableColumnMenu: true,
                      renderCell: (params) => {
                        const isSelected = selectedColumnMappings.some((selected, idx) => 
                          JSON.stringify(selected) === JSON.stringify(columnMappings[params.row.id])
                        );
                        return (
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedColumnMappings([...selectedColumnMappings, columnMappings[params.row.id]]);
                              } else {
                                setSelectedColumnMappings(
                                  selectedColumnMappings.filter((_, idx) => 
                                    JSON.stringify(columnMappings[params.row.id]) !== JSON.stringify(_)
                                  )
                                );
                              }
                            }}
                          />
                        );
                      }
                    },
                    { field: 'sourceTable', headerName: 'Source Table', width: 150 },
                    { field: 'sourceColumn', headerName: 'Source Column', width: 150 },
                    { field: 'targetTable', headerName: 'Target Table', width: 150 },
                    { field: 'targetColumn', headerName: 'Target Column', width: 150 },
                    { field: 'alias', headerName: 'Alias', width: 150 },
                    { field: 'transformation', headerName: 'Transformation', width: 150 },
                    { 
                      field: 'actions', 
                      headerName: 'Actions', 
                      width: 150, 
                      sortable: false,
                      renderCell: (params) => (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(params.row.id)}
                            title="Edit"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMapping(params.row.id)}
                            title="Delete"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      )
                    },
                  ]}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                />
              </Box>
            </>
          )}

          {/* Transformation Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Transformation</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Transformation"
                value={transformationInput}
                onChange={(e) => setTransformationInput(e.target.value)}
                placeholder="Enter transformation logic"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTransformation} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>

          {/* Add Mapping Dialog */}
          <Dialog open={addMappingDialogOpen} onClose={handleAddMappingDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Column Mapping</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Source Table</InputLabel>
                <Select
                  label="Source Table"
                  value={newMapping.sourceTable}
                  onChange={(e) => setNewMapping({ ...newMapping, sourceTable: e.target.value, sourceColumn: '' })}
                >
                  {sourceSelectedTables.map((table) => (
                    <MenuItem key={table.table} value={table.table}>
                      {table.table}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Source Column</InputLabel>
                <Select
                  label="Source Column"
                  value={newMapping.sourceColumn}
                  onChange={(e) => setNewMapping({ ...newMapping, sourceColumn: e.target.value })}
                  disabled={!newMapping.sourceTable}
                >
                  {newMapping.sourceTable && Object.keys(sourceColumnMaster[newMapping.sourceTable] || {}).map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Target Table</InputLabel>
                <Select
                  label="Target Table"
                  value={newMapping.targetTable}
                  onChange={(e) => setNewMapping({ ...newMapping, targetTable: e.target.value, targetColumn: '' })}
                >
                  {targetSelectedTables.map((table) => (
                    <MenuItem key={table.table} value={table.table}>
                      {table.table}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Target Column</InputLabel>
                <Select
                  label="Target Column"
                  value={newMapping.targetColumn}
                  onChange={(e) => setNewMapping({ ...newMapping, targetColumn: e.target.value })}
                  disabled={!newMapping.targetTable}
                >
                  {newMapping.targetTable && Object.keys(targetColumnMaster[newMapping.targetTable] || {}).map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddMappingDialogClose}>Cancel</Button>
              <Button 
                onClick={handleAddMapping} 
                variant="contained"
                disabled={!newMapping.sourceTable || !newMapping.sourceColumn || !newMapping.targetTable || !newMapping.targetColumn}
              >
                Add Mapping
              </Button>
            </DialogActions>
          </Dialog>

          {/* Test Scenarios Selection */}
          {columnMappings.length > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                <Autocomplete
                  multiple
                  options={genericTestScenarios ? genericTestScenarios.map(scenario => scenario.scenario_name): []}
                  value={selectedTestScenarios}
                  onChange={(event, newValue) => setSelectedTestScenarios(newValue)}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        checked={selected}
                        sx={{ mr: 1 }}
                      />
                      {option}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Select Generic Test Scenarios"
                      placeholder="Choose scenarios"
                      size="small"
                    />
                  )}
                  sx={{ width: 300, mt: 3, mb: 2 }}
                />
                {showKeyColumnSelection && (
                  <div>
                    <Autocomplete
                      multiple
                      options={[...new Set(columnMappings.flatMap(mapping => [
                        mapping.sourceColumn,
                        mapping.targetColumn
                      ]))]}
                      value={keyColumns}
                      onChange={(event, newValue) => setKeyColumns(newValue)}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox
                          checked={selected}
                          sx={{ mr: 1 }}
                          />
                          {option}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                        {...params}
                        variant="outlined"
                        label="Select Key Columns"
                        placeholder="Choose key columns"
                        size="small"
                        />
                      )}
                      sx={{ width: 300, mt: 3, mb: 2, ml: 1 }}
                    />
                    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                      (Key Columns are only applied to test scenarios that involves data validations)
                    </Typography>
                  </div>
                )}
              </Box>
              
              <Box sx={{  mr: 5, mb: 6, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => {setCurrentStep(3); handleProceed();}}
                  disabled={selectedTestScenarios.length === 0 || (showKeyColumnSelection && keyColumns.length === 0)}
                >
                  Generate SQL
                </Button>
              </Box>
            </>
          )}
        
          {/* Review Generated SQL Section */}
          {currentStep === 3 && (
            <Box ref={reviewSqlRef}>
              <DisplayGeneratedSQL 
                generatedSQL={generatedSQL} 
                selectedOrgAppDetails={selectedOrgAppDetails} 
                sourceConnectionType={sourceConnectionType}
                targetConnectionType={targetConnectionType}
                sourceDB={sourceDB}
                targetDB={targetDB}
                // sourceSchema={sourceSchema}
                // targetSchema={targetSchema}
                setSelectedProspectiveTestcases={setSelectedProspectiveTestcases}
                setGeneratedSQL={setGeneratedSQL}
                />
                
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mt: 1 }}>
                {/* Test Suite */}
                <FormControl variant={"standard"}>
                    <InputLabel sx={{
                        // Apply custom styles for the label positioning
                        transform: 'translate(14px, 12px) scale(1)', 
                        // Shrink the label and move it to the top when focused/filled
                        '&.MuiInputLabel-shrink': { 
                            transform: 'translate(14px, -6px) scale(0.75)', 
                            backgroundColor: 'white',  // Set background color to white when label is shrunk
                            padding: '0 4px', // Optional: Adds some padding around the shrunk label
                            zIndex: 1, // Ensure the label appears above the text field
                        }
                        }}>Test Suite</InputLabel>
                    <Select
                        name="testSuiteId"
                        size="small"
                        variant="outlined"
                        sx={{
                            width: "300px"
                        }}
                        required
                        value={testSuiteValue}
                        onChange={(e) => {setTestSuiteValue(e.target.value);}}
                        onClose={() => setSearchTestSuite("")}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 200,
                                    overflowY: "auto",
                                },
                            },
                            autoFocus: false,
                        }}
                        renderValue={(selected) => {
                            return typeof selected === "object" && selected !== null
                                ? selected.name // If the selected value is an object, return its name
                                : testSuitInfo.find((option) => option?.id === selected)?.name ;
                        }}
                        >
                        <ListSubheader>
                            <TextField
                                size="small"
                                autoFocus
                                placeholder="Type to search..."
                                fullWidth
                                onChange={(e) => setSearchTestSuite(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key !== "Escape") {
                                        e.stopPropagation();
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                    ),
                                }}
                            />
                        </ListSubheader>
                        {displayedOptions.map((option) => (
                            <MenuItem
                                key={option?.id}
                                value={option?.id === -1 ? option?.name : option?.id}
                                onClick={() => {
                                    if (option?.id === -1) {
                                        setTestSuiteDialogOpen(true);
                                    }
                                }}
                            >
                                {option?.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {/* <FormHelperText>{getHelperText(index, "testSuiteId")}</FormHelperText> */}
                </FormControl> 
              </Box>

              <Box sx={{ mt: 3, mr: 10, ml: 10, mb: 6, display: 'flex', justifyContent: 'flex-end' }}>
                
                <Button
                  variant="contained"
                  onClick={() => {handleTestCaseCreation();}}
                  disabled={selectedProspectiveTestcases.length === 0 && !testSuiteValue}
                >
                  Create Test Case
                </Button>
              </Box>
            </Box>
          )}
          
        </>
      )}

      <TestSuiteDialog
        open={testSuiteDialogOpen}
        handleClose={() => {
            setTestSuiteDialogOpen(false);
            setIsRequired(false)}
        }
        saveTestSuite={saveTestSuite}
        title="Create Test Suite"
        isRequired={isRequired}
        testSuiteDetailes={testSuiteDetailes}
        setTestSuiteDetailes={setTestSuiteDetailes}
        setIsRequired={setIsRequired}/>
    </>
  );
};

export default DataTestingGenerator;
