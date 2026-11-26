// import React, { useState } from "react";
// import {
//   Container,
//   Paper,
//   Grid,
//   TextField,
//   FormControl,
//   MenuItem,
//   InputLabel,
//   Select,
//   Typography,
//   Button,
//   IconButton,
//   Box,
//   InputAdornment,
// } from "@mui/material";
// import { useSelector } from "react-redux";
// import * as classes from "./ConnectionDetails.module.css";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import DoneIcon from "@mui/icons-material/Done";
// import { Visibility, VisibilityOff } from "@mui/icons-material";


// const ConnectionDetails = () => {
//   const { organization, application, selectedOrgAppDetails } = useSelector(
//     (state) => state.data
//   );

//   const [selectedOrg, setSelectedOrg] = useState(organization);
//   const [selectedApp, setSelectedApp] = useState(application);
//   const [selectConnection, setselectedConnection] = useState("");
//   const [showButtons, setShowButtons] = useState(true);
//   const [inputs, setInputs] = useState([]);
//   const [showDone, setShowDone] = useState([]);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleClickShowPassword = () => {
//     setShowPassword(!showPassword);
//   };
//   const handleChange = (event, index) => {
//     setselectedConnection(event.target.value);
//     setShowButtons(event.target.value !== "Snowflake");
//   };
//   const handleAddInput = () => {
//     setInputs([...inputs, ""]);
//     setShowDone([...showDone, true]);
//   };

//   const handleInputChange = (event, index) => {
//     const newInputs = [...inputs];
//     newInputs[index] = event.target.value;
//     setInputs(newInputs);
//   };

//   const handleDeleteInput = (index) => {
//     const newInputs = [...inputs];
//     newInputs.splice(index, 1);
//     setInputs(newInputs);

//     const newShowDone = [...showDone];
//     newShowDone.splice(index, 1);
//     setShowDone(newShowDone);
//   };

//   const toggleDone = (index) => {
//     const newShowDone = [...showDone];
//     newShowDone[index] = !newShowDone[index];
//     setShowDone(newShowDone);
//   };

//   return (
//     <Container
//       style={{
//         margin: "20px auto",
//         overflowY: "auto",
//         height: "calc(100vh - 221px)",
//       }}
//     >
//       <Paper elevation={3} style={{ padding: "20px", marginTop: "10px" }}>
//         <Typography variant="h4" gutterBottom>
//           Connection Details
//         </Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="test-suite-label">
//                 Module Name <span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select labelId="test-suite-label" id="test-suite-select">
//                 <MenuItem value="MDT">MDT</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="organization-label">
//                 Organization Name<span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select
//                 labelId="organization-label"
//                 id="organization-select"
//                 value={selectedOrg}
//               >
//                 <MenuItem value={selectedOrgAppDetails.orgId}>
//                   {selectedOrgAppDetails.orgName}
//                 </MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="application-label">
//                 Application Name<span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select
//                 labelId="application-label"
//                 id="application-select"
//                 value={selectedApp}
//               >
//                 <MenuItem value={selectedOrgAppDetails.appId}>
//                   {selectedOrgAppDetails.appName}
//                 </MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="cloud-platform-label">
//                 Cloud Platform<span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select labelId="cloud-platform-label" id="cloud-platform-select">
//                 <MenuItem value="AWS">AWS</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>

//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="cloud-component-label">
//                 Cloud Component<span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select
//                 labelId="cloud-component-label"
//                 id="cloud-component-select"
//               >
//                 <MenuItem value="Secrets_Manager">Secrets_Manager</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="cloud-region-label">
//                 Cloud Region<span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select labelId="cloud-region-label" id="cloud-region-select">
//                 <MenuItem value="us-west-2">us-west-2</MenuItem>
//                 <MenuItem value="us-west-2">us-west-1</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>

//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <FormControl variant="standard" fullWidth margin="dense">
//               <InputLabel id="connection-type-label">
//                 Connection Type Name<span style={{ color: "red" }}>*</span>
//               </InputLabel>
//               <Select
//                 labelId="connection-type-label"
//                 id="connection-type-select"
//                 value={selectConnection}
//                 onChange={handleChange}
//               >
//                 <MenuItem value="Snowflake">Snowflake</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <TextField
//               label="Connection Name"
//               variant="standard"
//               required
//               fullWidth
//               margin="dense"
//               sx={{
//                 "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//               }}
//             />
//           </Grid>
//         </Grid>
//         {showButtons && (
//           <Grid
//             container
//             spacing={2}
//             marginTop={"-7px"}
//             justifyContent="flex-end "
//           >
//             <Grid item>
//               <Button variant="contained" className={classes.btn}>
//                 Close
//               </Button>
//             </Grid>
//             <Grid item>
//               <Button variant="contained" className={classes.btn}>
//                 Create
//               </Button>
//             </Grid>
//             <Grid item>
//               <Button variant="contained" className={classes.btn}>
//                 Test
//               </Button>
//             </Grid>
//             <Grid item>
//               <Button variant="contained" className={classes.btn}>
//                 Telnet
//               </Button>
//             </Grid>
//           </Grid>
//         )}
//       </Paper>

//       {selectConnection === "Snowflake" && (
//         <Paper
//           elevation={3}
//           style={{ padding: "20px", marginTop: "10px", marginBottom: "10px" }}
//         >
//           <Typography variant="h4" gutterBottom>
//             Key/Value
//           </Typography>
//           <Container style={{ width: "80%", margin: "auto" }}>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography fontWeight={"600"} variant="h6" margin="dense">
//                   Property Name
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Typography fontWeight={"600"} variant="h6" margin="dense">
//                   Property Value
//                 </Typography>
//               </Grid>
//             </Grid>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography className={classes.label}>Account</Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Enter Account"
//                   variant="standard"
//                   required
//                   fullWidth
//                   margin="dense"
//                   marginTop={"20px"}
//                   sx={{
//                     "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//                   }}
//                 />
//               </Grid>
//             </Grid>

//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography className={classes.label}>User</Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Enter User"
//                   variant="standard"
//                   required
//                   fullWidth
//                   sx={{
//                     "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//                   }}
//                   margin="dense"
//                 />
//               </Grid>
//             </Grid>

//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography className={classes.label}>Password</Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   variant="standard"
//                   type={showPassword ? "text" : "password"}
//                   label="Enter Password"
//                   required
//                   fullWidth
//                   margin="dense"
//                   sx={{
//                     "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//                   }}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton
//                           aria-label="toggle password visibility"
//                           onClick={handleClickShowPassword}
//                           edge="end"
//                         >
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </Grid>
//             </Grid>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography className={classes.label}>Warehouse</Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Enter Warehouse"
//                   variant="standard"
//                   required
//                   margin="dense"
//                   fullWidth
//                   sx={{
//                     "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//                   }}
//                 />
//               </Grid>
//             </Grid>

//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography className={classes.label}>Database</Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Enter Database"
//                   variant="standard"
//                   required
//                   fullWidth
//                   sx={{
//                     "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//                   }}
//                   margin="dense"
//                 />
//               </Grid>
//             </Grid>
//             <Grid container spacing={3}>
//               {inputs.map((value, index) => (
//                 <>
//                   <Grid item xs={12} md={6}>
//                     {showDone[index] ? (
//                       <TextField
//                         label={"Enter Label"}
//                         variant="standard"
//                         fullWidth
//                         value={value}
//                         margin="dense"
//                         onChange={(event) => handleInputChange(event, index)}
//                       />
//                     ) : (
//                       <Typography className={classes.label}>{value}</Typography>
//                     )}
//                   </Grid>
//                   <Grid item xs={12} md={6} position={"relative"}>
//                     <TextField
//                       label="Enter"
//                       variant="standard"
//                       required
//                       fullWidth
//                       sx={{
//                         "& .MuiFormLabel-asterisk": { color: "#FF0000" },
//                       }}
//                       margin="dense"
//                     />
//                     <Box
//                       style={{
//                         position: "absolute",
//                         right: "-80px",
//                         bottom: "0",
//                       }}
//                     >
//                       <IconButton onClick={() => handleDeleteInput(index)}>
//                         <DeleteIcon fontSize="small"/>
//                       </IconButton>
//                       {showDone[index] ? (
//                         <IconButton
//                           onClick={() => toggleDone(index)}
//                           disabled={!value.trim()}
//                         >
//                           <DoneIcon fontSize="small"/>
//                         </IconButton>
//                       ) : (
//                         <IconButton onClick={() => toggleDone(index)}>
//                           <EditIcon fontSize="small"/>
//                         </IconButton>
//                       )}
//                     </Box>
//                   </Grid>
//                 </>
//               ))}

//               <Grid item xs={12} md={6} marginTop={"20px"}>
//                 <Button
//                   variant="contained"
//                   onClick={() => handleAddInput()}
//                   startIcon={<AddIcon />}
//                   size="small"
//                 >
//                   Add Rows
//                 </Button>
//               </Grid>
//             </Grid>
//           </Container>
//           {!showButtons && (
//             <Grid
//               container
//               spacing={2}
//               marginTop={"10px"}
//               justifyContent="flex-end "
//             >
//               <Grid item>
//                 <Button variant="contained" className={classes.btn}>
//                   Close
//                 </Button>
//               </Grid>
//               <Grid item>
//                 <Button variant="contained" className={classes.btn}>
//                   Create
//                 </Button>
//               </Grid>
//               <Grid item>
//                 <Button variant="contained" className={classes.btn}>
//                   Test
//                 </Button>
//               </Grid>
//               <Grid item>
//                 <Button variant="contained" className={classes.btn}>
//                   Telnet
//                 </Button>
//               </Grid>
//             </Grid>
//           )}
//         </Paper>
//       )}
//     </Container>
//   );
// };

// export default ConnectionDetails;
