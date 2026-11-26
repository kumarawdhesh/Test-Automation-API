import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    CircularProgress,
    MenuItem,
    InputLabel,
    Select,
    Button,
} from '@mui/material';
import { 
    useGetReleaseTestCyclesMutation, 
    useGetTestClosureReportMutation, 
    useGetDomainWiseExecutionReportMutation, 
    useGetReleaseReportMutation 
} from '../../store/mdtSlice';
import TestCycleReportCard from './TestCycleReportCard';
import ReleaseWiseReportCard from './ReleaseWiseReportCard';
import Autocomplete from '@mui/material/Autocomplete';
import { closeLoading, showLoading } from '../../store/appSlice';
import DomainWiseReportCard from './DomainWiseReportCard';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Cancel } from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList';

const Reports = () => {
    const dispatch = useDispatch();

    const [selectedReport, setSelectedReport] = useState('');
    const [selectedTestCycle, setSelectedTestCycle] = useState('');
    const [selectedRelease, setSelectedRelease] = useState('');

    const [testCycles, setTestCycles] = useState([]);
    const [releases, setReleases] = useState([]);
    const [loadingTestCycles, setLoadingTestCycles] = useState(false);

    const [testClosureReport, setTestClosureReport] = useState(null);
    const [domainWiseReport, setDomainWiseReport] = useState(null);
    const [releaseReportData, setReleaseReportData] = useState(null);

    const [selectedDomain, setSelectedDomain] = useState('');
    const [selectedSubDomain, setSelectedSubDomain] = useState('');
    const [selectedOrgApplications, setSelectedOrgApplications] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);


    const { selectedOrgAppDetails, getUserAccessInfo } = useSelector((state) => state?.data);
    const [getReleaseTestCycles] = useGetReleaseTestCyclesMutation();
    const [getTestClosureReport] = useGetTestClosureReportMutation();
    const [getDomainWiseExecutionReport] = useGetDomainWiseExecutionReportMutation();
    const [getReleaseReport] = useGetReleaseReportMutation();

    const reportOptions = [
        { value: 'test-closure-report', label: 'Test Cycle Closure Report' },
        { value: 'domain-wise-execution-report', label: 'Domain Wise Execution Report' },
        { value: 'release-wise-execution-report', label: 'Release Wise Execution Report' },
    ];

    const handleReportChange = (event) => {
        const reportValue = event.target.value;
        setSelectedReport(reportValue);

        // Reset test cycle selection when report changes
        setSelectedTestCycle('');
        setTestClosureReport(null);

        // Fetch test cycles if test-closure-report is selected
        if (reportValue === 'test-closure-report' || reportValue === 'release-wise-execution-report') {
            fetchTestReleaseAndCycle(reportValue);
        }
    };

    const fetchTestReleaseAndCycle = async (reportValue) => {
        if (!selectedOrgAppDetails) return;

        setLoadingTestCycles(true);
        try {
            const { data: response, error } = await getReleaseTestCycles({
                function_name: "get-release-testcycles",
                domain_name: selectedOrgAppDetails.orgName,
                sub_domain_name: selectedOrgAppDetails.appName,
                user_id: sessionStorage.getItem("username"),
            });

            if (response && response.data && response.statusCode === 200) {
                if(reportValue === 'test-closure-report') {
                    const allTestCycles = [];
                    response.data.test_cycles.forEach(cycle => {
                        allTestCycles.push({
                            test_cycle_id: cycle.test_cycle_id,
                            test_cycle_name: cycle.test_cycle_name
                        });
                    });
                    setTestCycles(allTestCycles);
                } else if (reportValue === 'release-wise-execution-report') {
                    const allReleases = []
                    response.data.releases.forEach(release => {
                        allReleases.push({
                            release_id: release.release_id,
                            release_name: release.release_name
                        });
                    });
                    setReleases(allReleases);
                }
            }

            if (error) {
                console.error("Error fetching test cycles:", error);
                setTestCycles([]);
            }
        } catch (error) {
            console.error("Error fetching test cycles:", error);
            setTestCycles([]);
        } finally {
            setLoadingTestCycles(false);
        }
    };

    const fetchTestClosureReport = async (testCycleId) => {
        if (!selectedOrgAppDetails || !testCycleId) return;

        try {
            dispatch(showLoading(true));
            const { data: response, error } = await getTestClosureReport({
                function_name: "generate_test_cycle_report",
                user_id: sessionStorage.getItem("username"),
                test_cycle_id: testCycleId,
            });

            if (error) {
                console.error("Error fetching test closure report:", error);
                setTestClosureReport(null);
            } else {
                setTestClosureReport(response)
            }
        } catch (error) {
            console.error("Error fetching test closure report:", error);
            setTestClosureReport(null);
        } finally {
            dispatch(closeLoading());
        }
    };

    const fetchDomainWiseReport = async (domainName, subDomainName, start_date = null, end_date = null) => {
        try {
            dispatch(showLoading(true));
            const { data: response, error } = await getDomainWiseExecutionReport({
                function_name: "generate_domain_report",
                user_id: sessionStorage.getItem("username"),
                domain_name: domainName,
                sub_domain_name: subDomainName,
                start_date: start_date ? dayjs(start_date).format('YYYY-MM-DD') : null,
                end_date: end_date ? dayjs(end_date).format('YYYY-MM-DD') : null,
            });

            if (error) {
                console.error("Error fetching domain wise report:", error);
            } else {
                setDomainWiseReport(response.body);
            }
        } catch (error) {
            console.error("Error fetching domain wise report:", error);
        } finally {
            dispatch(closeLoading());
        }
    };

    const fetchReleaseReport = async (releaseId) => {
        if (!selectedOrgAppDetails || !releaseId) return;

        try {
            dispatch(showLoading(true));
            const { data: response, error } = await getReleaseReport({
                function_name: "generate_release_report",
                user_id: sessionStorage.getItem("username"),
                release_id: releaseId,
                domain_name: selectedOrgAppDetails.orgName,
                sub_domain_name: selectedOrgAppDetails.appName,
            });

            if (error) {
                console.error("Error fetching release wise report:", error);
                setReleaseReportData(null);
            } else {
                setReleaseReportData(response.body);
            }
        } catch (error) {
            console.error("Error fetching release wise report:", error);
        } finally {
            dispatch(closeLoading());
        }
    };

    // Fetch test cycles on component mount if needed
    useEffect(() => {
        if (selectedReport === 'test-closure-report') {
            fetchTestReleaseAndCycle();
        }
    }, [selectedOrgAppDetails]);

    const handleDateChange = (setter) => (date) => {
        setter(date);
    };

    const clearDomainWiseFilters = () => {
        setSelectedDomain('');
        setSelectedSubDomain('');
        setSelectedOrgApplications([]);
        setStartDate(null);
        setEndDate(null);
        setDomainWiseReport(null);
    };

    const handleApplyFilters = () => {
        fetchDomainWiseReport(selectedDomain, selectedSubDomain, startDate, endDate);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, maxWidth: 400 }}>
                <FormControl fullWidth>
                    <TextField
                        id="report-select"
                        size='small'
                        select
                        value={selectedReport}
                        label="Select Report"
                        onChange={handleReportChange}
                    >
                        {reportOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
            </Box>

            {/* Test Cycle Selection with Search - Only show when test-closure-report is selected */}
            {selectedReport === 'test-closure-report' && (
                <Box sx={{ mb: 3, maxWidth: 400 }}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="test-cycle-autocomplete"
                            size="small"
                            options={testCycles}
                            getOptionLabel={(option) => option.test_cycle_name || ''}
                            loading={loadingTestCycles}
                            value={testCycles.find(tc => tc.test_cycle_id === selectedTestCycle) || null}
                            onChange={(_, newValue) => {
                                setSelectedTestCycle(newValue ? newValue.test_cycle_id : '');
                                setTestClosureReport(null);
                                if (newValue) fetchTestClosureReport(newValue.test_cycle_id);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Test Cycle"
                                    placeholder="Search test cycles..."
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingTestCycles ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.test_cycle_id === value.test_cycle_id}
                            noOptionsText={loadingTestCycles ? "Loading test cycles..." : "No test cycles found"}
                        />
                    </FormControl>
                </Box>
            )}

            {selectedReport === 'domain-wise-execution-report' && (
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", mb: 3 }}>
                    {/* Domain Select */}
                    <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 150, marginRight: '10px' }}>
                        <InputLabel id="org-select-label">
                            Domain <span style={{ color: "red" }}>*</span>
                        </InputLabel>
                        <Select
                            labelId="org-select-label"
                            value={selectedDomain}
                            onChange={(event) => {
                                const selectedOrg = event.target.value

                                if (selectedOrg) {
                                    // dispatch(setMdtData({ application: "" }));
                                    setSelectedDomain(selectedOrg);
                                    setSelectedOrgApplications(getUserAccessInfo?.organizations.find(orgs => orgs.name === selectedOrg).applications);
                                }
                            }}
                            label="Domain *"
                        >
                            {(getUserAccessInfo?.organizations || []).map((org) => (
                                <MenuItem key={org.name} value={org.name}>
                                    {org.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Sub Domain Select */}
                    <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 150 }}>
                        <InputLabel id="app-select-label">
                            Sub Domain <span style={{ color: "red" }}>*</span>
                        </InputLabel>
                        <Select
                            labelId="app-select-label"
                            value={selectedSubDomain}
                            disabled={!selectedDomain}
                            onChange={(e) => {
                                setSelectedSubDomain(e.target.value);
                            }}
                            label="Sub Domain *"

                        >
                            {(selectedOrgApplications || []).map((app) => (
                                <MenuItem key={app.name} value={app.name}>
                                    {app.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Date Range Filters */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start Date (Optional)"
                            value={startDate}
                            onChange={handleDateChange(setStartDate)}
                            slotProps={{ textField: { size: 'small', sx: { m: 1, minWidth: 150 } } }}
                            format="YYYY-MM-DD"
                        />
                        <DatePicker
                            label="End Date (Optional)"
                            value={endDate}
                            onChange={handleDateChange(setEndDate)}
                            slotProps={{ textField: { size: 'small', sx: { m: 1, minWidth: 150 } } }}
                            format="YYYY-MM-DD"
                        />
                    </LocalizationProvider>

                    <div>
                        <Button startIcon={<FilterListIcon />} variant='contained' size='small' onClick={handleApplyFilters} sx={{ ml: 2 }}>Apply Filters</Button>
                        <Button startIcon={<Cancel />} variant='contained' size='small' onClick={clearDomainWiseFilters} sx={{ ml: 2 }}>Clear Filters</Button>
                    </div>
                </Box>
            )}

            {selectedReport === 'release-wise-execution-report' && (
                <Box sx={{ mb: 3, maxWidth: 400 }}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="test-release-autocomplete"
                            size="small"
                            options={releases}
                            getOptionLabel={(option) => option.release_name || ''}
                            loading={loadingTestCycles}
                            value={releases.find(tc => tc.release_id === selectedRelease) || null}
                            onChange={(_, newValue) => {
                                setSelectedRelease(newValue ? newValue.release_id : '');
                                setReleaseReportData(null);
                                if (newValue) fetchReleaseReport(newValue.release_id);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Release"
                                    placeholder="Search Release..."
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingTestCycles ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.release_id === value.release_id}
                            noOptionsText={loadingTestCycles ? "Loading releases..." : "No release found"}
                        />
                    </FormControl>
                </Box>
            )}

            {/* Report Display Area */}
            {selectedReport && selectedReport === 'test-closure-report' && selectedTestCycle && (
                <Box sx={{ mt: 3 }}>
                    <TestCycleReportCard
                        testCaseExecutionHistory={testClosureReport?.test_case_execution_history}
                        testCaseSummary={testClosureReport?.test_case_run_summary}
                        testCycleSummary={testClosureReport?.test_cycle_summary}
                        finalSummary={testClosureReport?.final_summary}
                    />
                </Box>
            )}
            {selectedReport && selectedReport === 'domain-wise-execution-report' && domainWiseReport && (
                <Box sx={{ mt: 3 }}>
                    <DomainWiseReportCard
                        reportData={domainWiseReport}
                    />
                </Box>
            )}

            {selectedReport && selectedReport === 'release-wise-execution-report' && selectedRelease && releaseReportData && (
                <Box sx={{ mt: 3 }}>
                    <ReleaseWiseReportCard
                        reportData={releaseReportData}
                    />
                </Box>
            )}

            {/* Initial state message */}
            {
                !selectedReport && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            Please select a report to view details
                        </Typography>
                    </Box>
                )
            }
        </Box >
    );
};

export default Reports;
