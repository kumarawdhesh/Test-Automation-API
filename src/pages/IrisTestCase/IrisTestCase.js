import React, { useState } from "react";
import {
  Grid,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Box,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  FormLabel,
  Button,
  Popover,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { Info } from "@mui/icons-material";

const IrisTestCase = ({
  handleInputChange,
  getHelperText,
  field,
  handleTestTypeChange,
  index,
  classes,
  getDBDetailes,
  anchorEl,
  setAnchorEl,
  handleDomainSelect,
  handleWorkspaceSelect,
  irisDomainList,
  validateSqlHandler,
  nexusDomains,
}) => {
  const [openWorkspaceDetails, setOpenWorkspaceDetails] = useState(false);
  
  const handleClose = () => {
    setOpenWorkspaceDetails(false);
    setAnchorEl(null);
  };

  return (
    <>
      {/* Checkbox section */}
      <Box mb={2} sx={{display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 1.5 }}>
          {/* <div style={{width: "85%", display: "flex", justifyContent: "flex-end"}}> */}
            {["Similarity", "Similarity with data", "Consistency", "Accuracy", "SQL Validation", "Rephrase", "Summary", "Skip Semantic Memory"]
            .filter((type) => {
              if(type === "Accuracy"){
                return false;
              }
              if(field.execution_engine === "Nexus" && (type === "Rephrase" || type === "SQL Validation" || type === "Consistency")) {
                return false;
              }
              if(field.execution_engine !== "Nexus" && (type === "Skip Semantic Memory" || type === "Similarity" || type === "Similarity with data")) {
                return false;

              } else {
                return true;

              }})
            .map((type, idx) => {
              let disableTypeCheck = false;
              if (type === "Similarity" && field.test_type.includes("Similarity with data")) {
                disableTypeCheck = true;
              }
              return <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    disabled={disableTypeCheck}
                    checked={field.test_type.includes(type)}
                    onChange={(e) => handleTestTypeChange(e, index, type)}
                  />
                }
                label={type}
                name="test_type"
                // disabled={field.execution_engine === "Iris" && !field.iris_version} // This disables the checkbox if iris_version is not selected and Execution Engine is Iris
              />
            })}
            <FormHelperText> {getHelperText(index, "test_type")}</FormHelperText>
          {/* </div> */}
      </Box>

      {field.test_type?.includes("Consistency") && (

          <Box sx={{ width: "60%" }}>
            <FormControl variant="standard" className={classes.formControl} sx={{ width: "100%" }}>
              <TextField
                variant="outlined"
                select
                label="Select Iteration"
                fullWidth
                size="small"
                name="iteration"
                value={field.iteration}
                onChange={(e) => handleInputChange(e, index)}
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>
              </TextField>
              <FormHelperText>{getHelperText(index, "iteration")}</FormHelperText>
            </FormControl>
          </Box>
          
      )}

      {/* {field.test_type?.includes("Accuracy") && field?.execution_engine !== "Nexus" && (
          <Box sx={{ width: "60%" }}>
            <FormControl variant="standard" className={classes.formControl} sx={{ width: "100%" }}>
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                label="Select Database Connection"
                select
                name="sourceDB"
                value={field.sourceDB}
                onChange={(e) => handleInputChange(e, index)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 150,
                      overflowY: "auto",
                    },
                  },
                }}
              >
                {getDBDetailes[index]?.map((conn) => (
                  <MenuItem key={conn.connectionName} value={conn.connectionName}>
                    {conn.connectionName}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText>{getHelperText(index, "sourceDB")}</FormHelperText>
            </FormControl>
          </Box>
      )} */}

      {field.execution_engine !== "Nexus" ? (
        <Box sx={{ display: "flex", gap: 3, width: "60%" }}>
          {/* Question to IRIS */}
          <FormControl sx={{ width: "50%" }}>
            <FormLabel
              sx={{
                marginBottom: "15px",
                width: "100%",
                textAlign: "left",
                fontFamily: "inter",
              }}
            >
              Enter Question
            </FormLabel>
            <TextField
              sx={{
                ".MuiInputBase-root": {
                  display: "block !important",
                },
                marginBottom: "15px",
                whiteSpace: "pre-line",
              }}
              variant="outlined"
              size="small"
              autoComplete="off"
              multiline
              rows={4}
              name="Question_to_IRIS"
              value={field.Question_to_IRIS}
              onChange={(e) => handleInputChange(e, index)}
              placeholder="Type here…"
              helperText={getHelperText(index, "Question_to_IRIS")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" style={{ padding: "20px 0" }}>
                    <IconButton
                      style={{ padding: 0 }}
                      onClick={(event) => setAnchorEl(event.currentTarget)}
                      disabled={!field.iris_version}
                    >
                      <TuneIcon />
                    </IconButton>
                    <div style={{ margin: "0 6px" }}>
                      <p style={{ fontWeight: "500" }}>{field.domain || "Choose a Domain"}</p>
                    </div>
                  </InputAdornment>
                ),
              }}
              disabled={!field.iris_version}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              name="domain"
              PaperProps={{
                style: {
                  maxHeight: 200,
                  width: 250,
                },
              }}
            >
              {irisDomainList.length > 0 ? (
                <MenuItem disabled value="">
                  <em>Choose a Domain</em>
                </MenuItem>
              ) : (
                <MenuItem disabled value="">
                  <em>No data available</em>
                </MenuItem>
              )}
              {irisDomainList.map((domain) => (
                <MenuItem key={domain} onClick={() => handleDomainSelect(domain, index)}>
                  {domain}
                </MenuItem>
              ))}
            </Menu>
          </FormControl>
          {/* Expected SQL for IRIS */}
          <FormControl sx={{ width: "50%" }}>
            <FormLabel
              style={{
                fontFamily: "inter",
                textAlign: "left",
              }}
            >
              Add expected SQL
            </FormLabel>
            <TextField
              placeholder="Type here..."
              multiline
              rows={6}
              style={{ marginTop: "15px" }}
              sx={{ marginBottom: "15px" }}
              name="Expected_SQL"
              value={field.Expected_SQL}
              onChange={(e) => handleInputChange(e, index)}
              helperText={getHelperText(index, "Expected_SQL")}
              disabled={!field.iris_version}
            />
            <Button 
              variant="contained" 
              style={{ width: "50%"}} 
              className={"btn"} 
              disabled={(
                field.isSqlValid ||
                field.sourceConnection === "" ||
                field.sourceDB === "" ||
                field.Expected_SQL === ""
              )}
              onClick={() => {validateSqlHandler('iris', field, index)}}
            >
              Validate SQL
            </Button>
          </FormControl>
        </Box>
      ) : null}

      {field.execution_engine === "Nexus" ? (
        <>
          {/* Workspace Selection */}
          <Box sx={{ width: "60%", display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 9 }}>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                select
                label={"WorkSpace Name"}
                name="workspace_name"
                value={field?.workspace?.workspace_id || ""}
                onChange={(e) => { handleWorkspaceSelect(e, index) }}
                sx={{ marginBottom: "20px" }}
              >
                {nexusDomains.map((domain) => (
                  <MenuItem value={domain.workspace_id} key={domain.workspace_id}>
                    {domain.workspace_name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <IconButton
                aria-label="info"
                onClick={(event) => {
                  setAnchorEl(event.currentTarget);
                  setOpenWorkspaceDetails(true);
                }}
                sx={{ marginBottom: "20px" }}
              >
                <Info />
              </IconButton>
            </Box>
          </Box>
          <Popover
            open={openWorkspaceDetails}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box sx={{ padding: "10px", width: "500px" }}>
              <p><strong>Workspace Name:</strong> {field?.workspace?.workspace_name || "N/A"}</p>
              <p><strong>Workspace ID:</strong> {field?.workspace?.workspace_id || "N/A"}</p>
              <p><strong>Domain Name:</strong> {field?.workspace?.domain_name || "N/A"}</p>
              <p><strong>Created By:</strong> {field?.workspace?.created_by || "N/A"}</p>
              <p><strong>Version ID:</strong> {field?.workspace?.version_id || "N/A"}</p>
              <p><strong>Version Name:</strong> {field?.workspace?.version_name || "N/A"}</p>
              <p><strong>Connection ID:</strong> {field?.workspace?.connection_id || "N/A"}</p>
              <p><strong>Connection Name:</strong> {field?.workspace?.connection_name || "N/A"}</p>
            </Box>
          </Popover>

          <Box sx={{ width: "60%" }}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              required
              label={"Question"}
              sx={{ marginBottom: "15px" }}
              name="Question_to_Nexus"
              value={field.Question_to_Nexus}
              onChange={(e) => handleInputChange(e, index)}
              />
          </Box>

          {(field.test_type?.includes("Similarity") || field.test_type?.includes("Similarity with data")) && <Box sx={{ width: "60%" }}>
              <TextField
                label="Expected SQL"
                multiline
                fullWidth
                required={field.test_type?.includes("similarity")}
                rows={5}
                sx={{ marginBottom: "15px" }}
                name="Nexus_Expected_SQL"
                value={field.Nexus_Expected_SQL}
                onChange={(e) => handleInputChange(e, index)}
              />
              <Button 
                variant="contained" 
                style={{ width: "30%"}} 
                className={"btn"} 
                disabled={(field.isSqlValid 
                  || field.sourceConnection === "" 
                  || field.workspace?.workspace_id === ""
                  || field.Nexus_Expected_SQL === "")
                }
                onClick={() => {validateSqlHandler('nexus', field, index)}}>
                Validate SQL
              </Button>
          </Box>}
        </>
      ) : null}
    </>
  );
};

export default IrisTestCase;
