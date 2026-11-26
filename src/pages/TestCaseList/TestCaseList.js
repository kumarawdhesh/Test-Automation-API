import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete,
  Edit,
} from "@mui/icons-material";
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";


const TestCaseList = () => {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'testcaseid', direction: "asc" });
  const [showTestCasePage, setShowTestCasePage] = useState(false)
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const {organization, application} = useSelector(state => state.data)

  const rows = [
    {
      id: 1,
      testcaseid: "46",
      testcasename: "Test case 76",
      testcasedes: "test_case_desc",
      testsuite: "Default",
      test: "testing",
    },
    {
      id: 2,
      testcaseid: "47",
      testcasename: "Test case 2",
      testcasedes: "test_case_desc",
      testsuite: "Default",
      test: "testing",
    },
    {
      id: 3,
      testcaseid: "48",
      testcasename: "Test case 3",
      testcasedes: "test_case_desc",
      testsuite: "Default",
      test: "testing",
    },
    {
      id: 4,
      testcaseid: "49",
      testcasename: "Test case 4",
      testcasedes: "test_case_desc",
      testsuite: "Default",
      test: "testing",
    },
    {
      id: 5,
      testcaseid: "50",
      testcasename: "Test case 5",
      testcasedes: "test_case_desc",
      testsuite: "Default",
      test: "testing",
    },
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortableTableCell = ({ label, onClick, sortKey }) => (
    <TableCell onClick={() => handleSort(sortKey)} style={{ cursor: "pointer" }}>
      {label}
      <span style={{ verticalAlign: "middle", fontSize: "1.2em", marginLeft: "5px" }}>
        {sortConfig.key === sortKey && sortConfig.direction === "asc" ? (
          <ArrowUpward fontSize="inherit" style={{ fontSize: 20 }} />
        ) : (
          <ArrowDownward fontSize="inherit" style={{ fontSize: 20 }} />
        )}
      </span>
    </TableCell>
  );

  const sortedRows = [...rows].sort((a, b) => {
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortConfig.direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else {
      return sortConfig.direction === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });
  const filteredAndSortedRows = sortedRows.filter((row) =>
    row.testcaseid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.testcasename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.testcasedes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.testsuite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.test.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCheckbox = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  

  return (

    // <Grid item xs={9} style={{ padding: "15px 0" }}>
    //   <div
    //     style={{
    //       padding: "20px",
    //       borderRadius: "15px",
    //       backgroundColor: "white",
    //       margin: "10px",
    //       boxShadow: "0px 0px 10px -7px",
    //     }}
    //   >
    //     <Grid container direction="column" spacing={2}>
    //       <Grid item>
    //         <Typography variant="h5" align="center" marginTop="20px" gutterBottom>
    //           Test Suite / Cases
    //         </Typography>
    //       </Grid>
    //       <Grid item container justifyContent="space-between" alignItems="center">
    //         <Grid item>
    //           <TextField
    //             label="Search"
    //             variant="outlined"
    //             value={searchTerm}
    //             onChange={(e) => setSearchTerm(e.target.value)}
    //             InputProps={{
    //               endAdornment: (
    //                 <InputAdornment position="end">
    //                   <IconButton style={{ padding: '8px' }}>
    //                     <SearchIcon />
    //                   </IconButton>
    //                 </InputAdornment>
    //               ),
    //             }}
    //           />
    //         </Grid>
    //         <Grid item>
    //           <button
    //             style={{
    //               background: "#404c4f",
    //               color: "white",
    //               padding: "8px 20px",
    //               border: 0,
    //               fontSize: "16px",
    //               borderRadius: "5px",
    //               marginRight: "10px",
    //             }}
    //           // onClick={handleClick}
    //           >
    //             New Test Suite{" "}
    //           </button>
    //           <button
    //             style={{
    //               background: "#404c4f",
    //               color: "white",
    //               padding: "8px 20px",
    //               border: 0,
    //               fontSize: "16px",
    //               borderRadius: "5px",
    //               marginRight: "10px",
    //             }}
    //           // onClick={handleClick}
    //           >
    //             New Test Cases{" "}
    //           </button>
    //           <button
    //             style={{
    //               background: "#404c4f",
    //               color: "white",
    //               padding: "8px 20px",
    //               border: 0,
    //               fontSize: "16px",
    //               borderRadius: "5px",
    //             }}
    //           >
    //             {" "}
    //             Execute
    //           </button>
    //         </Grid>

    //       </Grid>
    //       <Grid item>
    //         <TableContainer component={Paper}>
    //           <Table>
    //             <TableHead>
    //               <TableRow>
    //                 <TableCell padding="checkbox">
    //                   <Checkbox
    //                     color="success"
    //                     indeterminate={selected.length > 0 && selected.length < rows.length}
    //                     checked={selected.length === rows.length}
    //                     onChange={(event) =>
    //                       event.target.checked ? setSelected(rows.map((row) => row.id)) : setSelected([])
    //                     }
    //                     disabled={filteredAndSortedRows.length == 0}
    //                   />
    //                 </TableCell>
    //                 <TableCell>Execute</TableCell>

    //                 <SortableTableCell
    //                   label="Test Case Id"
    //                   onClick={() => handleSort("testcaseid")}
    //                   sortKey="testcaseid"

    //                 />
    //                 <SortableTableCell
    //                   label="Test Case Name"
    //                   onClick={() => handleSort("testcasename")}
    //                   sortKey="testcasename"

    //                 />
    //                 <SortableTableCell
    //                   label="Test Case Des"
    //                   onClick={() => handleSort("testcasedes")}
    //                   sortKey="testcasedes"
    //                 />
    //                 <SortableTableCell
    //                   label="Test Suit"
    //                   onClick={() => handleSort("testsuite")}
    //                   sortKey="testsuite"
    //                 />
    //                 <SortableTableCell
    //                   label="Test"
    //                   onClick={() => handleSort("test")}
    //                   sortKey="test"
    //                 />
    //                 <TableCell>Action</TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <Accordion>
    //               <AccordionSummary>
    //                 hduhduh
    //               </AccordionSummary>
    //               <AccordionDetails>
    //                 {filteredAndSortedRows.length === 0 ? (
    //                   <TableRow>
    //                     <TableCell colSpan={7}>
    //                       <Typography variant="body1" align="center" marginTop="20px">
    //                         No results found
    //                       </Typography>
    //                     </TableCell>
    //                   </TableRow>
    //                 ) : (
    //                   <TableBody>
    //                     {filteredAndSortedRows
    //                       .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    //                       .map((row) => {
    //                         const isItemSelected = selected.indexOf(row.id) !== -1;
    //                         const labelId = `enhanced-table-checkbox-${row.id}`;

    //                         return (
    //                           <TableRow
    //                             key={row.id}
    //                             hover
    //                             role="checkbox"
    //                             selected={isItemSelected}
    //                             onClick={(event) => handleCheckbox(event, row.id)}
    //                           >
    //                             <TableCell padding="checkbox">
    //                               <Checkbox
    //                                 color="success"
    //                                 checked={isItemSelected}
    //                                 inputProps={{
    //                                   "aria-labelledby": labelId,
    //                                 }}
    //                               />
    //                             </TableCell>
    //                             <TableCell>{row.id}</TableCell>
    //                             <TableCell>{row.testcaseid}</TableCell>
    //                             <TableCell>{row.testcasename}</TableCell>
    //                             <TableCell>{row.testcasedes}</TableCell>
    //                             <TableCell>{row.testsuite}</TableCell>
    //                             <TableCell>{row.test}</TableCell>
    //                             <TableCell>
    //                               <IconButton color="primary">
    //                                 <Edit />
    //                               </IconButton>
    //                               <IconButton style={{ color: "black" }}>
    //                                 <Delete />
    //                               </IconButton>
    //                             </TableCell>
    //                           </TableRow>
    //                         );
    //                       })}
    //                   </TableBody>
    //                 )}
    //               </AccordionDetails>
    //             </Accordion>
    //           </Table>
    //           <TablePagination
    //             rowsPerPageOptions={[5, 10, 25]}
    //             component="div"
    //             count={filteredAndSortedRows.length}
    //             rowsPerPage={rowsPerPage}
    //             page={page}
    //             onPageChange={(event, newPage) => setPage(newPage)}
    //             onRowsPerPageChange={(event) => {
    //               setRowsPerPage(parseInt(event.target.value, 10));
    //               setPage(0);
    //             }}
    //           />
    //         </TableContainer>
    //       </Grid>
    //     </Grid>
    //   </div>
    // </Grid>

    <Grid item xs={9} style={{ padding: "15px 0" }}>
    <div
      style={{
        padding: "20px",
        borderRadius: "15px",
        backgroundColor: "white",
        margin: "10px",
        boxShadow: "0px 0px 10px -7px",
      }}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h5" align="center" marginTop="20px" gutterBottom>
            Test Suite / Cases
          </Typography>
        </Grid>
        <Grid item container justifyContent="space-between" alignItems="center">
          <Grid item>
            <TextField
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton style={{ padding: '8px' }}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <button
              style={{
                background: "#404c4f",
                color: "white",
                padding: "8px 20px",
                border: 0,
                fontSize: "16px",
                borderRadius: "5px",
                marginRight: "10px",
              }}
            // onClick={handleClick}
            >
              New Test Suite{" "}
            </button>
            <button
              style={{
                background: "#404c4f",
                color: "white",
                padding: "8px 20px",
                border: 0,
                fontSize: "16px",
                borderRadius: "5px",
                marginRight: "10px",
              }}
            // onClick={handleClick}
            >
              New Test Cases{" "}
            </button>
            <button
              style={{
                background: "#404c4f",
                color: "white",
                padding: "8px 20px",
                border: 0,
                fontSize: "16px",
                borderRadius: "5px",
              }}
            >
              {" "}
              Execute
            </button>
          </Grid>

        </Grid>
        <Grid item>

          <TableContainer component={Paper}>
          <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="success"
                          indeterminate={selected.length > 0 && selected.length < rows.length}
                          checked={selected.length === rows.length}
                          onChange={(event) =>
                            event.target.checked ? setSelected(rows.map((row) => row.id)) : setSelected([])
                          }
                          disabled={filteredAndSortedRows.length == 0}
                        />
                      </TableCell>
                      <TableCell>Id</TableCell>
                      <TableCell>Test Suite Name</TableCell>
                      <TableCell>Test Suite Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{height:"50px"}}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="success"
                          indeterminate={selected.length > 0 && selected.length < rows.length}
                          checked={selected.length === rows.length}
                          onChange={(event) =>
                            event.target.checked ? setSelected(rows.map((row) => row.id)) : setSelected([])
                          }
                          disabled={filteredAndSortedRows.length == 0}
                        />
                      </TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>Test case 2</TableCell>
                      <TableCell >test_case_desc</TableCell>
                      <TableCell>
                                <IconButton color="primary">
                                  <Edit />
                                </IconButton>
                                <IconButton style={{ color: "black" }}>
                                  <Delete />
                                </IconButton>
                              </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </AccordionSummary>
              <AccordionDetails>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="success"
                          indeterminate={selected.length > 0 && selected.length < rows.length}
                          checked={selected.length === rows.length}
                          onChange={(event) =>
                            event.target.checked ? setSelected(rows.map((row) => row.id)) : setSelected([])
                          }
                          disabled={filteredAndSortedRows.length == 0}
                        />
                      </TableCell>
                      <TableCell>Execute</TableCell>

                      <SortableTableCell
                        label="Test Case Id"
                        onClick={() => handleSort("testcaseid")}
                        sortKey="testcaseid"

                      />
                      <SortableTableCell
                        label="Test Case Name"
                        onClick={() => handleSort("testcasename")}
                        sortKey="testcasename"

                      />
                      <SortableTableCell
                        label="Test Case Des"
                        onClick={() => handleSort("testcasedes")}
                        sortKey="testcasedes"
                      />
                      <SortableTableCell
                        label="Test Suite"
                        onClick={() => handleSort("testsuite")}
                        sortKey="testsuite"
                      />
                      <SortableTableCell
                        label="Test"
                        onClick={() => handleSort("test")}
                        sortKey="test"
                      />
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  {filteredAndSortedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography variant="body1" align="center" marginTop="20px">
                          No results found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableBody>
                      {filteredAndSortedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          const isItemSelected = selected.indexOf(row.id) !== -1;
                          const labelId = `enhanced-table-checkbox-${row.id}`;

                          return (
                            <TableRow
                              key={row.id}
                              hover
                              role="checkbox"
                              selected={isItemSelected}
                              onClick={(event) => handleCheckbox(event, row.id)}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="success"
                                  checked={isItemSelected}
                                  inputProps={{
                                    "aria-labelledby": labelId,
                                  }}
                                />
                              </TableCell>
                              <TableCell>{row.id}</TableCell>
                              <TableCell>{row.testcaseid}</TableCell>
                              <TableCell>{row.testcasename}</TableCell>
                              <TableCell>{row.testcasedes}</TableCell>
                              <TableCell>{row.testsuite}</TableCell>
                              <TableCell>{row.test}</TableCell>
                              <TableCell>
                                <IconButton color="primary">
                                  <Edit />
                                </IconButton>
                                <IconButton style={{ color: "black" }}>
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  )}

                </Table>
              </AccordionDetails>
            </Accordion>
             <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{height:"50px"}}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="success"
                          indeterminate={selected.length > 0 && selected.length < rows.length}
                          checked={selected.length === rows.length}
                          onChange={(event) =>
                            event.target.checked ? setSelected(rows.map((row) => row.id)) : setSelected([])
                          }
                          disabled={filteredAndSortedRows.length == 0}
                        />
                      </TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>Test case 2</TableCell>
                      <TableCell>test_case_desc</TableCell>
                      <TableCell>
                                <IconButton color="primary">
                                  <Edit />
                                </IconButton>
                                <IconButton style={{ color: "black" }}>
                                  <Delete />
                                </IconButton>
                              </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </AccordionSummary>
              <AccordionDetails>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="success"
                          indeterminate={selected.length > 0 && selected.length < rows.length}
                          checked={selected.length === rows.length}
                          onChange={(event) =>
                            event.target.checked ? setSelected(rows.map((row) => row.id)) : setSelected([])
                          }
                          disabled={filteredAndSortedRows.length == 0}
                        />
                      </TableCell>
                      <TableCell>Execute</TableCell>

                      <SortableTableCell
                        label="Test Case Id"
                        onClick={() => handleSort("testcaseid")}
                        sortKey="testcaseid"

                      />
                      <SortableTableCell
                        label="Test Case Name"
                        onClick={() => handleSort("testcasename")}
                        sortKey="testcasename"

                      />
                      <SortableTableCell
                        label="Test Case Des"
                        onClick={() => handleSort("testcasedes")}
                        sortKey="testcasedes"
                      />
                      <SortableTableCell
                        label="Test Suite"
                        onClick={() => handleSort("testsuite")}
                        sortKey="testsuite"
                      />
                      <SortableTableCell
                        label="Test"
                        onClick={() => handleSort("test")}
                        sortKey="test"
                      />
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  {filteredAndSortedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography variant="body1" align="center" marginTop="20px">
                          No results found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableBody>
                      {filteredAndSortedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          const isItemSelected = selected.indexOf(row.id) !== -1;
                          const labelId = `enhanced-table-checkbox-${row.id}`;

                          return (
                            <TableRow
                              key={row.id}
                              hover
                              role="checkbox"
                              selected={isItemSelected}
                              onClick={(event) => handleCheckbox(event, row.id)}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="success"
                                  checked={isItemSelected}
                                  inputProps={{
                                    "aria-labelledby": labelId,
                                  }}
                                />
                              </TableCell>
                              <TableCell>{row.id}</TableCell>
                              <TableCell>{row.testcaseid}</TableCell>
                              <TableCell>{row.testcasename}</TableCell>
                              <TableCell>{row.testcasedes}</TableCell>
                              <TableCell>{row.testsuite}</TableCell>
                              <TableCell>{row.test}</TableCell>
                              <TableCell>
                                <IconButton color="primary">
                                  <Edit />
                                </IconButton>
                                <IconButton style={{ color: "black" }}>
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  )}

                </Table>
              </AccordionDetails>
            </Accordion> 
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAndSortedRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
          
        </Grid>
      </Grid>
    </div>
  </Grid>
  )
    ;
};

export default TestCaseList;

