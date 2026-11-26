import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Chip,
    Divider,
    Tabs,
    Tab
} from '@mui/material';
import { AgCharts as AgChartsReact } from 'ag-charts-react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ReleaseWiseReportCard = ({ reportData }) => {
    const [selectedRelease, setSelectedRelease] = useState(reportData?.release_summary?.release_id || '');
    const [activeTab, setActiveTab] = useState(0);

    if (!reportData) {
        return <Typography>No data available</Typography>;
    }

    const { release_summary, domain_breakdown, test_cycle_breakdown, failure_categorization, cycle_comparison, ai_summary } = reportData;

    // Chart for Domain Breakdown
    const domainChartOptions = {
        title: {
            text: 'Domain Breakdown'
        },
        data: domain_breakdown.map(d => ({
            domain: `${d.domain_name} - ${d.sub_domain_name}`,
            passPercentage: d.pass_percentage,
            failPercentage: 100 - d.pass_percentage
        })),
        series: [
            {
                type: 'bar',
                xKey: 'domain',
                yKey: 'passPercentage',
                yName: 'Pass %'
            },
            {
                type: 'bar',
                xKey: 'domain',
                yKey: 'failPercentage',
                yName: 'Fail %'
            }
        ]
    };

    // Chart for Failure Categorization
    const failureChartOptions = {
        title: {
            text: 'Failure Categorization'
        },
        data: failure_categorization,
        series: [
            {
                type: 'pie',
                angleKey: 'count',
                labelKey: 'failure_category'
            }
        ]
    };

    // Chart for Cycle Comparison Trend
    const cycleComparisonData = cycle_comparison.map(c => ({
        cycle: `C${c.current_cycle_id}`,
        passPercentage: c.current_pass_percentage,
        trend: c.trend
    }));

    const trendChartOptions = {
        title: {
            text: 'Pass Rate Trend'
        },
        data: cycleComparisonData,
        series: [
            {
                type: 'line',
                xKey: 'cycle',
                yKey: 'passPercentage',
                yName: 'Pass Percentage'
            }
        ]
    };

    const getTrendIcon = (trend) => {
        if (trend === 'Improvement') return <TrendingUpIcon sx={{ color: 'green' }} />;
        if (trend === 'Regression') return <TrendingDownIcon sx={{ color: 'red' }} />;
        return null;
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 80) return '#4caf50';
        if (percentage >= 60) return '#ff9800';
        return '#f44336';
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', flex: 1 }}>
                    <Typography color="textSecondary" gutterBottom>
                        Pass Rate
                    </Typography>
                    <Typography variant="h4" sx={{ color: getStatusColor(release_summary.pass_percentage) }}>
                        {release_summary.pass_percentage}%
                    </Typography>
                    <LinearProgress variant="determinate" value={release_summary.pass_percentage} sx={{ mt: 1 }} />
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5', flex: 1 }}>
                    <Typography color="textSecondary" gutterBottom>
                        Test Cases
                    </Typography>
                    <Typography variant="h4">
                        {release_summary.unique_test_cases}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        {release_summary.total_test_case_executions_count} executions
                    </Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec', flex: 1 }}>
                    <Typography color="textSecondary" gutterBottom>
                        Test Cycles
                    </Typography>
                    <Typography variant="h4">
                        {release_summary.total_test_cycles}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', flex: 1 }}>
                    <Typography color="textSecondary" gutterBottom>
                        Avg Execution Time
                    </Typography>
                    <Typography variant="h4">
                        {release_summary.avg_execution_time_sec}s
                    </Typography>
                </Paper>
            </Box>

            {/* Tabbed Content */}
            <Card sx={{ mb: 6 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Charts" />
                    <Tab label="Test Cycle Breakdown" />
                    <Tab label="Cycle Comparison" />
                    <Tab label="AI Summary" />
                </Tabs>

                <CardContent>
                    {/* Charts Tab */}
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <AgChartsReact options={domainChartOptions} />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <AgChartsReact options={failureChartOptions} />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <AgChartsReact options={trendChartOptions} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* Test Cycle Breakdown Tab */}
                    {activeTab === 1 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Cycle Name</strong></TableCell>
                                        <TableCell align="right"><strong>Test Cases</strong></TableCell>
                                        <TableCell align="right"><strong>Pass %</strong></TableCell>
                                        <TableCell align="right"><strong>Passed</strong></TableCell>
                                        <TableCell align="right"><strong>Failed</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {test_cycle_breakdown.map((cycle) => (
                                        <TableRow key={cycle.test_cycle_id}>
                                            <TableCell>{cycle.test_cycle_name}</TableCell>
                                            <TableCell align="right">{cycle.unique_test_cases}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={`${cycle.pass_percentage}%`}
                                                    color={cycle.pass_percentage >= 80 ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip label={cycle.pass_count} color="success" size="small" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip label={cycle.fail_count} color="error" size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Cycle Comparison Tab */}
                    {activeTab === 2 && cycle_comparison.length > 0 && (
                        <Grid container spacing={2}>
                            {cycle_comparison.map((comparison) => (
                                <Grid item xs={12} sm={6} key={comparison.current_cycle_id}>
                                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    Current vs Previous
                                                </Typography>
                                                <Typography variant="h6">
                                                    {comparison.current_pass_percentage}% vs {comparison.previous_pass_percentage}%
                                                </Typography>
                                                <Typography variant="body2">
                                                    Delta: {comparison.pass_rate_delta > 0 ? '+' : ''}{comparison.pass_rate_delta}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getTrendIcon(comparison.trend)}
                                                <Chip label={comparison.trend} size="small" />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* AI Summary Tab */}
                    {activeTab === 3 && ai_summary && (
                        <Box>
                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                {ai_summary || "No summary available for the selected release."}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ReleaseWiseReportCard;