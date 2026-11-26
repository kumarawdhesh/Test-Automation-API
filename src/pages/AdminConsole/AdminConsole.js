// import React, { useState } from "react";
// import {
//   Tabs,
//   Tab,
//   Typography,
//   Box,
//   Button,
//   Button,
//   IconButton,
//   Container,
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import { Delete, Edit } from "@mui/icons-material";
// import * as classes from "./AdminConsole.module.css";
// import CreateUserDialog from "../../components/CreateUserDialog/CreateUserDialog";
// import ConnectionDetails from "../ConnectionDetails/ConnectionDetails";

// const AdminConsole = () => {
//   const [value, setValue] = useState(0);
//   const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
//   const getRowClassName = (params) => {
//     return params.indexRelativeToCurrentPage % 2 === 0
//       ? classes["bg-light-green"]
//       : classes["bg-white"];
//   };

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   const handleAdminChange = (id) => {
//     console.log(`Admin status changed for row ${id}`);
//   };
//   const columns = [
//     {
//       field: "id",
//       headerName: "Id",
//       justifyContent: "center",
//       width: 200,
//       headerClassName: classes["header"],
//       headerAlign: "center",
//       align: "center",
//     },
//     {
//       field: "Users",
//       headerName: "Users",
//       width: 200,
//       justifyContent: "center",
//       headerClassName: classes["header"],
//       headerAlign: "center",
//       align: "center",
//     },
//     {
//       field: "isAdmin",
//       headerName: "Admin",
//       type: "boolean",
//       width: 200,
//       headerClassName: classes["header"],
//       headerAlign: "center",
//       align: "center",
//       renderCell: (params) => (
//         <input
//           className={classes.checkbox}
//           type="checkbox"
//           checked={params.value}
//           onChange={() => handleAdminChange(params.row.id)}
//         />
//       ),
//     },
//     {
//       field: "isTester",
//       headerName: "Tester",
//       type: "boolean",
//       width: 200,
//       headerClassName: classes["header"],
//       headerAlign: "center",
//       align: "center",
//       renderCell: (params) => (
//         <input
//           type="checkbox"
//           className={classes.checkbox}
//           checked={params.value}
//           onChange={() => handleAdminChange(params.row.id)}
//         />
//       ),
//     },
//     {
//       field: "Action",
//       headerName: "Action",
//       width: 200,
//       disableColumnMenu: true,
//       headerClassName: classes["header"],
//       headerAlign: "center",
//       align: "center",
//       sortable: false,
//       renderCell: (params) => {
//         return (
//           <Box>
//             <IconButton>
//               <Edit fontSize="small" />
//             </IconButton>
//             <IconButton>
//               <Delete fontSize="small" />
//             </IconButton>
//           </Box>
//         );
//       },
//     },
//   ];

//   const rows = [
//     { id: 1, Users: "Snow", Admin: "", Tester: false },
//     { id: 2, Users: "Lannister", Admin: false, Tester: false },
//     { id: 3, Users: "Lannister", Admin: false, Tester: false },
//     { id: 4, Users: "Snow", Admin: false, Tester: false },
//     { id: 5, Users: "Lannister", Admin: false, Tester: false },
//     { id: 6, Users: "Lannister", Admin: false, Tester: false },
//     { id: 7, Users: "Lannister", Admin: false, Tester: false },
//   ];

//   return (
//     <>
//       <Container>
//         <Box sx={{ width: "100%", marginTop: "75px" }}>
//           <Tabs
//             value={value}
//             onChange={handleChange}
//             textColor="secondary"
//             indicatorColor="secondary"
//             centered
//             variant="fullWidth"
//             sx={{ marginBottom: "30px" }}
//           >
//             <Tab label="USER DETAILS" />
//             <Tab label="CONNECTION DETAILS" />
//             <Tab label="ORGANIZATION DETAILS" />
//           </Tabs>
//           <TabPanel value={value} index={0}>
//             <div style={{ height: 326, width: "100%" }}>
//               <DataGrid
//                 rows={rows}
//                 columns={columns}
//                 hideFooterPagination
//                 hideFooter
//                 disableColumnMenu
//                 rowHeight={39}
//                 getRowClassName={getRowClassName}
//                 sx={{
//                   "& .MuiDataGrid-sortIcon": {
//                     color: "white",
//                   },
//                   "& .MuiDataGrid-iconButtonContainer": {
//                     visibility: "visible",
//                     width: "0 !important",
//                   },
//                 }}
//               />
//             </div>
//             <Box mt={2} display="flex" justifyContent="flex-end">
//               <Button
//                 className={classes.btn}
//                 variant="contained"
//                 onClick={() => setCreateUserDialogOpen(true)}
//                 size="small"
//               >
//                 Create User
//               </Button>
//             </Box>
//           </TabPanel>
//           <TabPanel value={value} index={1}>
//             <ConnectionDetails/>
//           </TabPanel>
//           <TabPanel value={value} index={2}>
//             <Typography>Content for Tab 3</Typography>
//           </TabPanel>
//         </Box>
//       </Container>
//       <CreateUserDialog
//         open={createUserDialogOpen}
//         handleClose={() => setCreateUserDialogOpen(false)}
//       />
//     </>
//   );
// };

// const TabPanel = (props) => {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`tabpanel-${index}`}
//       aria-labelledby={`tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box>{children}</Box>}
//     </div>
//   );
// };

// export default AdminConsole;


// // import React, { useEffect, useState } from "react";
// // import {
// //   Tabs,
// //   Tab,
// //   Typography,
// //   Box,
// //   Button,
// //   Button,
// //   IconButton,
// //   Container,
// //   Select,
// //   Grid,
// //   TextField,
// //   MenuItem,
// //   FormHelperText,
// //   getHelperText,
// //   FormControl,
// //   InputLabel,
// // } from "@mui/material";
// // //import Accordion from "@mui/material/Accordion";
// // //import AccordionSummary from "@mui/material/AccordionSummary";
// // import AccordionDetails from "@mui/material/AccordionDetails";
// // import { DataGrid } from "@mui/x-data-grid";
// // import { Delete, Edit } from "@mui/icons-material";
// // import * as classes from "./AdminConsole.module.css";
// // import CreateUserDialog from "../../components/CreateUserDialog/CreateUserDialog";
// // import ConnectionDetails from "../ConnectionDetails/ConnectionDetails";

// // const AdminConsole = () => {
// //   const [value, setValue] = useState(0);
// //   const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
// //   const [selectDB, setselectDB] = useState('')
// //   const getRowClassName = (params) => {
// //     return params.indexRelativeToCurrentPage % 2 === 0
// //       ? classes["bg-light-green"]
// //       : classes["bg-white"];
// //   };

// //   const handleInputChange = (event) => {
// //     setselectDB(event.target.value);
// //   };
  
// //   const handleChange = (event, newValue) => {
// //     setValue(newValue);
// //   };

// //   const handleAdminChange = (id) => {
// //     console.log(`Admin status changed for row ${id}`);
// //   };
// //   const columns = [
// //     {
// //       field: "id",
// //       headerName: "Id",
// //       justifyContent: "center",
// //       width: 200,
// //       headerClassName: classes["header"],
// //       headerAlign: "center",
// //       align: "center",
// //     },
// //     {
// //       field: "Users",
// //       headerName: "Users",
// //       width: 200,
// //       justifyContent: "center",
// //       headerClassName: classes["header"],
// //       headerAlign: "center",
// //       align: "center",
// //     },
// //     {
// //       field: "isAdmin",
// //       headerName: "Admin",
// //       type: "boolean",
// //       width: 200,
// //       headerClassName: classes["header"],
// //       headerAlign: "center",
// //       align: "center",
// //       renderCell: (params) => (
// //         <input
// //           className={classes.checkbox}
// //           type="checkbox"
// //           checked={params.value}
// //           onChange={() => handleAdminChange(params.row.id)}
// //         />
// //       ),
// //     },
// //     {
// //       field: "isTester",
// //       headerName: "Tester",
// //       type: "boolean",
// //       width: 200,
// //       headerClassName: classes["header"],
// //       headerAlign: "center",
// //       align: "center",
// //       renderCell: (params) => (
// //         <input
// //           type="checkbox"
// //           className={classes.checkbox}
// //           checked={params.value}
// //           onChange={() => handleAdminChange(params.row.id)}
// //         />
// //       ),
// //     },
// //     {
// //       field: "Action",
// //       headerName: "Action",
// //       width: 200,
// //       disableColumnMenu: true,
// //       headerClassName: classes["header"],
// //       headerAlign: "center",
// //       align: "center",
// //       sortable: false,
// //       renderCell: (params) => {
// //         return (
// //           <Box>
// //             <IconButton>
// //               <Edit fontSize="small" />
// //             </IconButton>
// //             <IconButton>
// //               <Delete fontSize="small" />
// //             </IconButton>
// //           </Box>
// //         );
// //       },
// //     },
// //   ];

// //   const rows = [
// //     { id: 1, Users: "Snow", Admin: "", Tester: false },
// //     { id: 2, Users: "Lannister", Admin: false, Tester: false },
// //     { id: 3, Users: "Lannister", Admin: false, Tester: false },
// //     { id: 4, Users: "Snow", Admin: false, Tester: false },
// //     { id: 5, Users: "Lannister", Admin: false, Tester: false },
// //     { id: 6, Users: "Lannister", Admin: false, Tester: false },
// //     { id: 7, Users: "Lannister", Admin: false, Tester: false },
// //   ];

// //   return (
// //     <>
// //       <Container>
// //         <Box sx={{ width: "100%", marginTop: "75px" }}>
// //           <Tabs
// //             value={value}
// //             onChange={handleChange}
// //             textColor="secondary"
// //             indicatorColor="secondary"
// //             centered
// //             variant="fullWidth"
// //             sx={{ marginBottom: "30px" }}
// //           >
// //             <Tab label="USER DETAILS" />
// //             <Tab label="CONNECTION DETAILS" />
// //             <Tab label="ORGANIZATION DETAILS" />
// //           </Tabs>
// //           <TabPanel value={value} index={0}>
// //             <div style={{ height: 326, width: "100%" }}>
// //               <DataGrid
// //                 rows={rows}
// //                 columns={columns}
// //                 hideFooterPagination
// //                 hideFooter
// //                 disableColumnMenu
// //                 rowHeight={39}
// //                 getRowClassName={getRowClassName}
// //                 sx={{
// //                   "& .MuiDataGrid-sortIcon": {
// //                     color: "white",
// //                   },
// //                   "& .MuiDataGrid-iconButtonContainer": {
// //                     visibility: "visible",
// //                     width: "0 !important",
// //                   },
// //                 }}
// //               />
// //             </div>
// //             <Box mt={2} display="flex" justifyContent="flex-end">
// //               <Button
// //                 className={classes.btn}
// //                 variant="contained"
// //                 onClick={() => setCreateUserDialogOpen(true)}
// //                 size="small"
// //               >
// //                 Create User
// //               </Button>
// //             </Box>
// //           </TabPanel>
// //           <TabPanel value={value} index={1}>
// //             <AccordionDetails style={{ display: "flex" }}>
// //               <FormControl variant="standard" sx={{ mx: 1, width: "50%" }}>
// //                 <InputLabel>
// //                   Source Connection Type <span style={{ color: "red" }}>*</span>
// //                 </InputLabel>
// //                 <Select
// //                   variant="standard"
// //                   size="small"
// //                   required
// //                   labelId="select-SourceConnection-label"
// //                   id="select-SourceConnection"
// //                   label="SourceConnection "
// //                   name="sourceConnection"
// //                   value={selectDB}
// //                   onChange={(e) => handleInputChange(e)}
// //                   MenuProps={{
// //                     PaperProps: {
// //                       style: {
// //                         maxHeight: 150,
// //                         overflowY: "auto",
// //                       },
// //                     },
// //                   }}
// //                 >
// //                   <MenuItem value="snowflake">
// //                    Snowflake
// //                   </MenuItem>
// //                   {/* {getConnectionDetailes?.connection_types?.map((data) => (
// //                         <MenuItem
// //                           key={data.connection_type_id}
// //                           value={data.connection_type_id}
// //                         >
// //                           {data.connection_type_name}
// //                         </MenuItem>
// //                       ))} */}
// //                 </Select>
// //                 <FormHelperText>
// //                   {/* {getHelperText(index, "sourceConnection")} */}
// //                 </FormHelperText>
// //               </FormControl>
// //             </AccordionDetails>
// //             {selectDB === "snowflake" &&
// //             <Container>
// //               <Box>
// //                 <Grid container spacing={2}>
// //                   <Grid item xs={6}>
// //                     <div style={{ display: "flex", justifyContent: "center" }}>
// //                       <FormControl
// //                         variant="standard"
// //                         sx={{ mx: 4, minWidth: "80%" }}
// //                       >
// //                         <TextField
// //                           variant="standard"
// //                           id="Connection Name"
// //                           label={
// //                             <>
// //                               Connection Name
// //                               <span style={{ color: "red" }}>*</span>
// //                             </>
// //                           }
// //                           name="ConnectionName"
// //                           //value={field.testCaseName}
// //                           //onChange={(e) => handleInputChange(e, index)}
// //                           //helperText={getHelperText(index, "testCaseName")}
// //                         />
// //                       </FormControl>
// //                     </div>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <div style={{ display: "flex", justifyContent: "center" }}>
// //                       <FormControl
// //                         variant="standard"
// //                         sx={{ mx: 4, minWidth: "80%" }}
// //                       >
// //                         <TextField
// //                           variant="standard"
// //                           id="SnowflakeAccount"
// //                           label="Snowflake Account"
// //                           name="SnowflakeAccount"
// //                           //value={field.testCaseDescription}
// //                           //onChange={(e)=>handleInputChange(e, index)}
// //                         />
// //                       </FormControl>
// //                     </div>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <div style={{ display: "flex", justifyContent: "center" }}>
// //                       <FormControl
// //                         variant="standard"
// //                         sx={{ mx: 4, minWidth: "80%" }}
// //                       >
// //                         <TextField
// //                           variant="standard"
// //                           id="SnowflakeUser"
// //                           label="Snowflake User"
// //                           name="SnowflakeUser"
// //                           //value={field.testCaseDescription}
// //                           //onChange={(e)=>handleInputChange(e, index)}
// //                         />
// //                       </FormControl>
// //                     </div>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <div style={{ display: "flex", justifyContent: "center" }}>
// //                       <FormControl
// //                         variant="standard"
// //                         sx={{ mx: 4, minWidth: "80%" }}
// //                       >
// //                         <TextField
// //                           variant="standard"
// //                           id="SnowflakePassword"
// //                           label="Snowflake Password"
// //                           name="SnowflakePassword"
// //                           //value={field.testCaseDescription}
// //                           //onChange={(e)=>handleInputChange(e, index)}
// //                         />
// //                       </FormControl>
// //                     </div>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <div style={{ display: "flex", justifyContent: "center" }}>
// //                       <FormControl
// //                         variant="standard"
// //                         sx={{ mx: 4, minWidth: "80%" }}
// //                       >
// //                         <TextField
// //                           variant="standard"
// //                           id="SnowflakeDatabase"
// //                           label="Snowflake Database"
// //                           name="SnowflakeDatabase"
// //                           //value={field.testCaseDescription}
// //                           //onChange={(e)=>handleInputChange(e, index)}
// //                         />
// //                       </FormControl>
// //                     </div>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <div style={{ display: "flex", justifyContent: "center" }}>
// //                       <FormControl
// //                         variant="standard"
// //                         sx={{ mx: 4, minWidth: "80%" }}
// //                       >
// //                         <TextField
// //                           variant="standard"
// //                           id="SnowflakeWarehouse"
// //                           label="Snowflake Warehouse"
// //                           name="SnowflakeWarehouse"
// //                           //value={field.testCaseDescription}
// //                           //onChange={(e)=>handleInputChange(e, index)}
// //                         />
// //                       </FormControl>
// //                     </div>
// //                   </Grid>
// //                 </Grid>

// //                 <p></p>
// //                 <div style={{ display: "flex", justifyContent: "right" }}>
// //                   <Button
// //                     className={classes.btn}
// //                     type="submit"
// //                     //onClick={() => resetTestCaseForm(index)}
// //                   >
// //                     Reset
// //                   </Button>
// //                   {
// //                     <Button
// //                       style={{
// //                         padding: "5px 15px",
// //                         fontSize: "14px",
// //                         border: "0",
// //                         borderRadius: "5px",
// //                         margin: "0 5px",
// //                         color: "black",
// //                         cursor: "pointer",
// //                         border: "1px solid #3fb802",
// //                       }}
// //                       type="submit"
// //                       //onClick={() => saveTestCaseForm()}
// //                     >
// //                       Save
// //                     </Button>
// //                   }
                  
// //                 </div>

// //               </Box>
        
// //             </Container>}
// //            < ConnectionDetails/>
// //           </TabPanel>

// //           <TabPanel value={value} index={2}>
// //             <Typography>Content for Tab 3</Typography>
// //           </TabPanel>
// //         </Box>
// //       </Container>
// //       <CreateUserDialog
// //         open={createUserDialogOpen}
// //         handleClose={() => setCreateUserDialogOpen(false)}
// //       />
// //     </>
// //   );
// // };

// // const TabPanel = (props) => {
// //   const { children, value, index, ...other } = props;

// //   return (
// //     <div
// //       role="tabpanel"
// //       hidden={value !== index}
// //       id={`tabpanel-${index}`}
// //       aria-labelledby={`tab-${index}`}
// //       {...other}
// //     >
// //       {value === index && <Box>{children}</Box>}
// //     </div>
// //   );
// // };

// // export default AdminConsole;