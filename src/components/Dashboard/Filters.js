import { Close, FilterAlt } from "@mui/icons-material";
import { Autocomplete, Box, Button, Drawer, IconButton, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Filters = ({
    drawerOpen, 
    setDrawerOpen, 
    fromDate, 
    toDate, 
    setFromDate, 
    userEmail, 
    setUserEmail, 
    setToDate, 
    emailError, 
    setEmailError,
    handleApplyFilter,
    handleClearFilter,
    domainName,
    subDomainName,
    setDomainName,
    setSubDomainName,
}) => {

    const { getUserAccessInfo } = useSelector((state) => state?.data);

    const [selectedOrgApps, setSelectedOrgApps] = useState([]);

    useEffect(() => {

    }, [])

    return (
        <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
            sx: { width: { xs: "90vw", sm: 400 }, p: 2 }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FilterAlt sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Filters
                </Typography>
                <IconButton onClick={() => setDrawerOpen(false)}>
                    <Close />
                </IconButton>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <DatePicker
                            label="From Date"
                            value={fromDate}
                            onChange={(e) => {setFromDate(e)}}
                            maxDate={toDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <DatePicker
                            label="To Date"
                            value={toDate}
                            onChange={setToDate}
                            minDate={fromDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Box>
                </LocalizationProvider>

                {/* Domain and Sub Domain selection */}
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                    <Autocomplete
                        multiple
                        id="domain-select"
                        options={(getUserAccessInfo?.organizations || []).map((org) => org.name)}
                        value={domainName || []}
                        onChange={(event, selectedDomain) => {
                            setDomainName(selectedDomain);
                            const filteredApps = getUserAccessInfo?.organizations?.filter(org => selectedDomain.includes(org.name) ) || [];
                            setSelectedOrgApps(filteredApps.reduce((acc, org) => {
                                return acc.concat(org.applications || []);
                            }, []));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Domain"
                                placeholder="Select Domain"
                            />
                        )}
                        sx={{width: "50%"}}
                    />

                    <Autocomplete
                        multiple
                        id="subdomain-select"
                        options={(selectedOrgApps || []).map((app) => app.name)}
                        value={subDomainName || []}
                        onChange={(event, selectedSubDomain) => {
                            setSubDomainName(selectedSubDomain);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Sub Domain"
                                placeholder="Select Sub Domain"
                            />
                        )}
                        sx={{width: "50%"}}
                    />
                </Box>
        
                <TextField
                    label="User Email"
                    value={userEmail}
                    onChange={(e) => {
                        setUserEmail(e.target.value);
                        if (e.target.value && !validateEmail(e.target.value)) {
                            setEmailError("Enter a valid email address");
                        } else {
                            setEmailError("");
                        }
                    }}
                    error={!!emailError}
                    helperText={emailError}
                    fullWidth
                    type="email"
                    size="medium"
                />
        
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyFilter}
                    // disabled={!fromDate || !toDate || (!!userEmail && !!emailError)}
                    >
                        Apply
                    </Button>
                    <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearFilter}
                    >
                        Clear
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
};

export default Filters;