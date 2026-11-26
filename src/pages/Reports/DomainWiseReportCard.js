import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { AgCharts as AgChartsReact } from 'ag-charts-react';
import {
  TrendingUp,
  CheckCircle,
  Schedule as Clock,
} from '@mui/icons-material';

const DomainWiseReportCard = ({ reportData }) => {
  const [activeTab, setActiveTab] = useState(0);  

  const {
    domain_summary = {},
    test_cycle_breakdown = [],
    test_case_summary = [],
    failure_hotspots = [],
    execution_trends_by_date = [],
    environment_comparison = [],
    flakiness_analysis = [],
    execution_time_anomalies = [],
    retry_analysis = {},
    failure_categorization = [],
    ai_summary = {},
  } = reportData || {};

  const COLORS = ['#4CAF50', '#FF5252', '#FFC107', '#2196F3', '#9C27B0'];

  // StatCard Component
  const StatCard = ({ title, value, unit = '', icon: Icon }) => (
    <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        {Icon && <Icon sx={{ mr: 1, fontSize: 28 }} />}
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}
            <span style={{ fontSize: '14px', marginLeft: '4px' }}>{unit}</span>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const formatDate = (dateString) => {
    if (!dateString || dateString.startsWith("0000-00-00")) return "-";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Domain-wise Test Report
      </Typography>

      {/* Domain Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Test Cycles"
            value={domain_summary.total_test_cycles || 0}
            icon={CheckCircle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Test Cases"
            value={domain_summary.unique_test_cases || 0}
            icon={CheckCircle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Domain Accuracy"
            value={domain_summary.pass_percentage || 0}
            unit="%"
            icon={TrendingUp}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Execution Time"
            value={domain_summary.avg_execution_time_sec || 0}
            unit="sec"
            icon={Clock}
          />
        </Grid>
      </Grid>

      {/* Environments */}
      {domain_summary.environments && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Environments
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {domain_summary.environments.split(',').map((env) => (
              <Chip key={env} label={env.trim()} variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {/* Tabs for different sections */}
      <Card sx={{ mt: 3, mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Cycle Breakdown" />
          <Tab label="Test Cases" />
          <Tab label="Failure Analysis" />
          <Tab label="Execution Trends" />
          <Tab label="Environment Comparison" />
          {/* <Tab label="Flakiness & Anomalies" /> */}
          <Tab label="Retry Analysis" />
          <Tab label="AI Summary" />
        </Tabs>

        <CardContent>
          {/* Cycle Breakdown */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Test Cycle Breakdown
              </Typography>
              {test_cycle_breakdown.length > 0 ? (
                <AgChartsReact
                  options={{
                    data: test_cycle_breakdown,
                    series: [
                      {
                        type: 'bar',
                        xKey: 'test_cycle_id',
                        yKey: 'unique_test_cases',
                        yName: 'Unique Test Cases',
                        stacked: true,
                        fill: '#4287f5ff',
                        strokeWidth: 0,
                      },
                      {
                        type: 'bar',
                        xKey: 'test_cycle_id',
                        yKey: 'pass_percentage',
                        yName: 'Pass Percentage',
                        stacked: true,
                        fill: '#22ff4eff',
                        strokeWidth: 0,
                      },
                    ],
                    title: { text: 'Test Cases vs Pass Percentage by Cycle' },
                  }}
                  style={{ height: '400px' }}
                />
              ) : (
                <Alert severity="info">No cycle breakdown data available</Alert>
              )}
            </Box>
          )}

          {/* Test Cases */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Test Case Summary
              </Typography>
              {test_case_summary.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>Test Case</TableCell>
                        <TableCell>Test Case Type</TableCell>
                        <TableCell align="right">Total Runs</TableCell>
                        <TableCell align="right">Pass Count</TableCell>
                        <TableCell align="right">Fail Count</TableCell>
                        <TableCell align="right">Pass %</TableCell>
                        <TableCell>First Run Date</TableCell>
                        <TableCell>Last Run Date</TableCell>
                        <TableCell>Latest Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {test_case_summary.map((tc, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{tc.test_case_name || `Test ${idx + 1}`}</TableCell>
                          <TableCell>{tc.test_case_type || 'N/A'}</TableCell>
                          <TableCell align="right">{tc.total_runs || 0}</TableCell>
                          <TableCell align="right">{tc.pass_count || 0}</TableCell>
                          <TableCell align="right">{tc.fail_count || 0}</TableCell>
                          <TableCell align="right">{tc.pass_percentage?.toFixed(2) || 0}%</TableCell>
                          <TableCell>{formatDate(tc.first_run_date) || 'N/A'}</TableCell>
                          <TableCell>{formatDate(tc.last_run_date) || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={tc.latest_status || 'Unknown'}
                              size="small"
                              color={tc.latest_status === 'Pass' || tc.latest_status === 'Force Pass' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No test case data available</Alert>
              )}
            </Box>
          )}

          {/* Failure Analysis */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Failure Hotspots
              </Typography>
              {failure_hotspots.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>Test Name</TableCell>
                        <TableCell align="right">Failure Count</TableCell>
                        <TableCell align="right">Affected Cycles</TableCell>
                        <TableCell>Failure Message</TableCell>
                        <TableCell>Last Failure Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {failure_hotspots.map((hotspot, idx) => (
                        <TableRow key={idx} hover sx={{ backgroundColor: '#ffebee' }}>
                          <TableCell>{hotspot.test_case_name || `N/A`}</TableCell>
                          <TableCell align="right">{hotspot.failure_count || 0}</TableCell>
                          <TableCell align="right">{hotspot.affected_cycles || 0}</TableCell>
                          <TableCell sx={{ maxWidth: 300, overflow: 'auto' }}>
                            <Typography variant="body2" sx={{ fontSize: '12px' }}>
                              {hotspot.failure_messages || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(hotspot.last_failure_date) || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success">No critical failures detected</Alert>
              )}
            </Box>
          )}

          {/* Execution Trends */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Execution Trends by Date
              </Typography>
              {execution_trends_by_date.length > 0 ? (
                <AgChartsReact
                  options={{
                    data: execution_trends_by_date,
                    series: [
                      { type: 'line', xKey: 'execution_date', yKey: 'total_executions', yName: 'Total Executions', stroke: '#8884d8', strokeWidth: 2, marker: { fill: '#8884d8' } },
                      { type: 'line', xKey: 'execution_date', yKey: 'pass_count', yName: 'Passed', stroke: '#82ca9d', strokeWidth: 2, marker: { fill: '#82ca9d' } },
                      { type: 'line', xKey: 'execution_date', yKey: 'fail_count', yName: 'Failed', stroke: '#ff6961', strokeWidth: 2, marker: { fill: '#ff6961' } },
                    ],
                    title: { text: 'Execution Trends Over Time' },
                  }}
                  style={{ height: '400px' }}
                />
              ) : (
                <Alert severity="info">No trend data available</Alert>
              )}
            </Box>
          )}

          {/* Environment Comparison */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Environment Comparison
              </Typography>
              {environment_comparison.length > 0 ? (
                <Grid container spacing={2}>
                  {environment_comparison.map((env, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {env.environment}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2">Pass Rate: {env.pass_percentage?.toFixed(2)}%</Typography>
                          <LinearProgress variant="determinate" value={env.pass_percentage || 0} sx={{ mt: 0.5 }} />
                        </Box>
                        <Typography variant="body2">Fail Count: {env.fail_count || 0}</Typography>
                        <Typography variant="body2">Unique Test Cases: {env.unique_test_cases || 0}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No environment data available</Alert>
              )}
            </Box>
          )}

          {/* Flakiness & Anomalies
          {activeTab === 5 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Flakiness Analysis
                  </Typography>
                  {flakiness_analysis.length > 0 ? (
                    <AgChartsReact
                      options={{
                        data: flakiness_analysis,
                        series: [
                          { type: 'pie', angleKey: 'flakiness_score', calloutLabelKey: 'test_name' },
                        ],
                        title: { text: 'Flakiness Score Distribution' },
                      }}
                      style={{ height: '300px' }}
                    />
                  ) : (
                    <Alert severity="info">No flakiness data available</Alert>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Execution Time Anomalies
                  </Typography>
                  {execution_time_anomalies.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell>Test</TableCell>
                            <TableCell align="right">Mean (s)</TableCell>
                            <TableCell align="right">Std Dev</TableCell>
                            <TableCell align="right">Deviation %</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {execution_time_anomalies.map((anomaly, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{anomaly.test_name || `Test ${idx}`}</TableCell>
                              <TableCell align="right">{anomaly.mean?.toFixed(2)}</TableCell>
                              <TableCell align="right">{anomaly.std_dev?.toFixed(2)}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${anomaly.deviation_percentage?.toFixed(1)}%`}
                                  size="small"
                                  color={anomaly.deviation_percentage > 50 ? 'error' : 'default'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="success">No anomalies detected</Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          )} */}

          {/* Retry Analysis */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Retry Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#E3F2FD' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Total Retries (Testcase)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {retry_analysis.summary.total_test_cases_with_retries || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#E8F5E9' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Success After Retry
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {retry_analysis.summary.successful_after_retry || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#FFF3E0' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Retry Success Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {retry_analysis.summary.retry_success_rate?.toFixed(2) || 0}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Retry Details Table */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Retry Details
              </Typography>
              {retry_analysis.retry_details && retry_analysis.retry_details.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>Test Case ID</TableCell>
                        <TableCell>Test Case Name</TableCell>
                        <TableCell align="right">Test Cycle ID</TableCell>
                        <TableCell align="right">Retry Count</TableCell>
                        <TableCell align="right">Success After Retry</TableCell>
                        <TableCell>Final Status</TableCell>
                        <TableCell>Last Execution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {retry_analysis.retry_details.map((detail, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{detail.test_case_id || 'N/A'}</TableCell>
                          <TableCell>{detail.test_case_name || 'N/A'}</TableCell>
                          <TableCell align="right">{detail.test_cycle_id || 'N/A'}</TableCell>
                          <TableCell align="right">{detail.retry_count || 0}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={detail.success_after_retry ? 'Yes' : 'No'}
                              size="small"
                              color={detail.success_after_retry ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={detail.final_status || 'Unknown'}
                              size="small"
                              color={detail.final_status === 'Pass' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatDate(detail.last_execution) || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No retry details available</Alert>
              )}

              {/* Failure Categorization */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Failure Categorization
              </Typography>
              {failure_categorization.length > 0 ? (
                <AgChartsReact
                  options={{
                    data: failure_categorization,
                    series: [
                      { type: 'pie', angleKey: 'count', calloutLabelKey: 'category' },
                    ],
                    title: { text: 'Failure Distribution by Category' },
                  }}
                  style={{ height: '300px' }}
                />
              ) : (
                <Alert severity="info">No failure categorization data</Alert>
              )}
            </Box>
          )}

          {/* AI Summary */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                AI-Generated Summary
              </Typography>
              {ai_summary && <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {ai_summary || "No summary available for this test cycle."}
              </Typography>} 
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DomainWiseReportCard;