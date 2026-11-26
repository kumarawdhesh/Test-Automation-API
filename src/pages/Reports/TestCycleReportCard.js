import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  Stack,
  Paper,
  Modal,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReplayIcon from '@mui/icons-material/Replay';
import SpeedIcon from '@mui/icons-material/Speed';

const TestCycleReportCard = ({ testCaseExecutionHistory, testCaseSummary = [], testCycleSummary, finalSummary }) => {
  const theme = useTheme();
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);

  if (!testCycleSummary) return null;

  const {
    avg_execution_time_sec,
    environments,
    first_run_date,
    highest_retry_count,
    last_run_date,
    pass_percentage,
    re_executed_test_cases,
    test_cycle_name,
    total_cycle_executions,
    total_failed,
    total_passed,
    total_test_case_executions_count,
    unique_test_cases
  } = testCycleSummary;

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const minutes = Math.floor(seconds / 60);
    // Rounding seconds to avoid floating point issues
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString.startsWith("0000-00-00")) return "-";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 95) return theme.palette.success.main;
    if (percentage >= 80) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 95) return <CheckCircleIcon />;
    if (percentage >= 80) return <TrendingUpIcon />;
    return <CancelIcon />;
  };

  // --- DataGrid columns for testCaseSummary ---
  const testCaseSummaryColumns = [
    { field: 'test_case_id', headerName: 'ID', width: 80 },
    { field: 'test_case_name', headerName: 'Test Case Name', flex: 1, minWidth: 200 },
    { field: 'total_runs', headerName: 'Total Runs', width: 110 },
    {
      field: 'latest_status',
      headerName: 'Latest Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Pass"
              ? "success"
              : params.value === "Fail"
              ? "error"
              : params.value === "Force Fail"
              ? "warning"
              : "default"
          }
          size="small"
        />
      ),
    },
    { field: 'pass_count', headerName: 'Pass', width: 80 },
    { field: 'fail_count', headerName: 'Fail', width: 80 },
    {
      field: 'first_run_date',
      headerName: 'First Run',
      width: 160,
      renderCell: (params) => {
        return formatDate(params.value)
      }
    },
    {
      field: 'last_run_date',
      headerName: 'Last Run',
      width: 160,
      renderCell: (params) => {
        return formatDate(params.value)
      }
    },
  ];

  // --- DataGrid columns for testCaseExecutionHistory ---
  const testCaseExecutionColumns = [
    { 
      field: 'tc_execution_start_ts', 
      headerName: 'Start Time', 
      width: 170, 
      renderCell: (params) => {
        return formatDate(params.value)
      } 
    },
    { 
      field: 'tc_execution_end_ts', 
      headerName: 'End Time', 
      width: 170, 
      renderCell: (params) => {
        return formatDate(params.value)
      } 
    },
    { field: 'tc_result_status', headerName: 'Status', width: 120, renderCell: (params) => (
      <Chip
        label={params.value}
        color={
          params.value === "Pass"
            ? "success"
            : params.value === "Fail"
            ? "error"
            : params.value === "Force Fail"
            ? "warning"
            : "default"
        }
        size="small"
      />
    ) },
    { field: 'execution_message', headerName: 'Execution Message', flex: 1, minWidth: 200 },
  ];

  // --- Prepare rows for DataGrid ---
  const testCaseSummaryRows = testCaseSummary.map((row) => ({
    ...row,
    id: row.test_case_id,
  }));

  const selectedExecutionRows =
    selectedTestCaseId && testCaseExecutionHistory[selectedTestCaseId]
      ? testCaseExecutionHistory[selectedTestCaseId].map((row, idx) => ({
          ...row,
          id: idx,
        }))
      : [];

  // --- Layout tweaks for summary cards ---
  return (
    <Box>
      {/* Enhanced Metrics Cards Row */}
      <Grid container spacing={3} sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', margin: '0 auto' }}>
        {/* Quick Stats Card */}
        <Box width={"30%"}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: theme.shadows[4],
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Quick Stats
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: theme.palette.primary.lighter }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {unique_test_cases}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Unique Test Cases
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: getStatusColor(pass_percentage) + '20' }}>
                  <Typography variant="h3" fontWeight="bold" color={getStatusColor(pass_percentage)}>
                    {pass_percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Success Rate
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: theme.palette.info.lighter }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {environments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Environment
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Test Results Card */}
        <Box width={"30%"}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: theme.shadows[4],
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Test Results
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Total Test Cases
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {total_test_case_executions_count}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: theme.palette.success.lighter }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" color="success.dark">
                      Passed
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {total_passed}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: theme.palette.error.lighter }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" color="error.dark">
                      Failed
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {total_failed}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Pass Rate
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={getStatusColor(pass_percentage)}>
                      {pass_percentage}%
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={pass_percentage}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${getStatusColor(pass_percentage)}, ${getStatusColor(pass_percentage)}dd)`,
                          borderRadius: 6,
                        }
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 11,
                      }}
                    >
                      {pass_percentage}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Performance Metrics Card */}
        <Box width={"30%"}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: theme.shadows[4],
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <SpeedIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  Performance Metrics
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.info.lighter }}>
                  <SpeedIcon sx={{ color: theme.palette.info.main, fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Avg Cycle Execution Time
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.dark">
                      {formatDuration(avg_execution_time_sec)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.warning.lighter }}>
                  <ReplayIcon sx={{ color: theme.palette.warning.main, fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Highest Retry Count
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.dark">
                      {highest_retry_count}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.success.lighter }}>
                  <AccessTimeIcon sx={{ color: theme.palette.success.main, fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Re-executed Cases
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.dark">
                      {re_executed_test_cases}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.primary.lighter }}>
                  <TrendingUpIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Total Executions
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.dark">
                      {total_cycle_executions}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>

      {/* Report Final Summary Section */}
      <Box sx={{ mt: 4, p: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1], mb: 5 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Report Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
          {finalSummary || "No summary available for this test cycle."}
        </Typography>
      </Box>

            {/* Timeline Card */}
      <Card variant="outlined" sx={{ mb: 2, mt: 2, p: 2, borderRadius: 2, backgroundColor: theme.palette.background.default, boxShadow: theme.shadows[2]  }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Timeline Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarTodayIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    First Run
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(first_run_date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarTodayIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Run
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(last_run_date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* --- Test Case Summary Table --- */}
      <Paper elevation={2} sx={{ p: 2, mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Test Case Summary
        </Typography>
        <Box sx={{ height: 350, width: '100%' }}>
          <DataGrid
            rows={testCaseSummaryRows}
            columns={testCaseSummaryColumns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            onRowClick={(params) => {
              setSelectedTestCaseId(params.row.test_case_id);
              setExecutionModalOpen(true);
            }}
            sx={{
              cursor: "pointer",
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: theme.palette.action.selected,
              },
            }}
            getRowClassName={(params) =>
              params.row.test_case_id === selectedTestCaseId ? 'Mui-selected' : ''
            }
          />
        </Box>
      </Paper>

      {/* --- Test Case Execution History Modal --- */}
      <Modal
        open={executionModalOpen}
        onClose={() => setExecutionModalOpen(false)}
        aria-labelledby="execution-history-modal-title"
        aria-describedby="execution-history-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            outline: 'none',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="execution-history-modal-title" variant="h6" gutterBottom>
              Execution History for Test Case: <b>{testCaseSummary.find(tc => tc.test_case_id === selectedTestCaseId)?.test_case_name}</b>
            </Typography>
            <IconButton onClick={() => setExecutionModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ height: 300, width: '100%' }}>
            <DataGrid
              rows={selectedExecutionRows}
              columns={testCaseExecutionColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              sx={{
                cursor: "pointer",
              }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default TestCycleReportCard;
