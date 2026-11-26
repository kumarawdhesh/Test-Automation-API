import { Box, Button, Paper, Input, TextField, InputAdornment, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useViewJaasStatusMutation } from "../../store/mdtSlice";
import { Search } from "@mui/icons-material";

export const View = () => {
    const [viewJaasStatus] = useViewJaasStatusMutation();

    const [JaasIssues, setJaasIssues] = useState([]);
    const [searchJaasIssues, setSearchJaasIssues] = useState("");

    useEffect(() => {
        fetchJaasIssues();
    }, []);

    // Fetch Jaas issues data from an API or service
    const fetchJaasIssues = async () => {        
        // Simulate fetching data
        const { data, error } = await viewJaasStatus({
            function_name: "get-all-jaas-tickets", 
            user_id: sessionStorage.getItem("username"),
            search_word: searchJaasIssues,
            // limit: 100,
            // offset: 0,
        });
        
        if (data && data.statusCode === 200) {            
            if(data?.body?.data.length) {
                setJaasIssues(data?.body?.data);
            }
        }        
    };

    // Handle search functionality
    const handleSearch = () => {
        if (searchJaasIssues.trim() !== "") {
            fetchJaasIssues();
        }
    }

    const columns = [
        { field: 'jaas_key', headerName: 'Jaas ID', flex: 1, 
            renderCell: (params) => (
                <Button
                    variant="text"
                    onClick={() => window.open(params.row.ticket_link, "_blank")}
                >
                    {params.value}
                </Button>
            )
        },
        { field: 'jaas_issue_type', headerName: 'Issue Type', flex: 1 },
        { field: "jaas_project_name", headerName: "Project Name", flex: 2 },
        { field: 'test_case_name', headerName: 'Test Case Name', flex: 2 },
        { field: 'tc_result_id', headerName: 'Test Case Result ID', flex: 1 },
        { field: 'test_cycle_name', headerName: 'Test Cycle Name', flex: 2 },
        { field: 'assignee', headerName: 'Assignee', flex: 2 },
        { field: 'created', headerName: 'Created At', flex: 2 },
        { field: 'status', headerName: 'Status', flex: 1 },
    ];

    return (
        <Paper
            elevation={0}
            style={{
                margin: "20px 15px 60px 15px",
            }}>
            {/* Search Functionality */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "10px" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                        label="Search Jaas Issues"
                        variant="outlined"
                        size="small"
                        value={searchJaasIssues}
                        onChange={(e) => setSearchJaasIssues(e.target.value)}
                        InputProps={{
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleSearch}>
                                    <Search />
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                    />
                    <Button 
                        variant="contained"
                        color="primary"
                        onClick={fetchJaasIssues} // Refresh button to fetch data
                        style={{ marginLeft: "10px" }}
                    >
                        Search
                    </Button>
                </Box>
            </Box>
            <DataGrid
                rows={JaasIssues}
                columns={columns}
                getRowId={(row) => row.jaas_key}
                pageSize={5}
                rowsPerPageOptions={[5]}
                sx={{ width: "100%" }}
            />
        </Paper>
    );
}
