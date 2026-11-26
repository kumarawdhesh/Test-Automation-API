import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, IconButton, LinearProgress, Menu, MenuItem, Modal, TextField, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import { closeLoading, showLoading, showSnackbar } from "../../store/appSlice";
import { AddCircle, Delete, Edit, MoreVert } from "@mui/icons-material";
import * as classes from "./TestSuiteHistory.module.css";
import TestsuiteDetails from "../TestsuiteDetails/TestsuiteDetails";
import { useDownloadTestSuiteReportMutation, useGetTestCaseMutation } from "../../store/mdtSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataFromStorage } from "../../utils/utility";
import { useNavigate } from "react-router-dom";
import { redirectToLogin } from "../../store/apiSlice";

const cloneModalstyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
  };

export const RenderTestSuites = ({
    filteredTestSuites,
    testSuites,
    loading, 
    handleAccordionClick,
    openedAccordion,
    handleEditTestSuite,
    type,
    fileContent,
    progress,
    handleDeleteTestSuiteConfirmation,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentTestSuite, setCurrentTestSuite] = useState(null);
    const [openCloneConfirmationModal, setOpenCloneConfirmationModal] = useState(false);
    const [cloneTestSuite, setCloneTestSuite] = useState(null);
    const open = Boolean(anchorEl);

    const navigate = useNavigate();
	  const dispatch = useDispatch();

    const [ getTestCase ] = useGetTestCaseMutation();
    const { selectedOrgAppDetails } = useSelector((state) => state.data);
    const [ downloadTestSuiteReport ] = useDownloadTestSuiteReportMutation();

    const handleClick = (event) => {
      event.stopPropagation();
    };

    if (loading) {
      return (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          Loading...
        </Typography>
      );
    }

    const progressBarForBulkUpload = (testSuite) => {
        const existingTestSuiteNames = new Set(testSuites.map((suite) => suite.name));
        const fileTestSuiteNames = new Set(
          Object.values(fileContent)
            .flat()
            .map((item) => item.testSuiteName)
        );

        const duplicateSuites = [...fileTestSuiteNames].filter((name) =>
          existingTestSuiteNames.has(name)
        );

        const isDuplicate = duplicateSuites.includes(testSuite.test_suite_name);

        if(type === "Bulk Upload" && isDuplicate) {

          return <Box
            sx={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "10px" }}
          >
            <LinearProgress
              style={{ width: "80px" }}
              variant="determinate"
              value={progress}
              sx={{
                backgroundColor: "##9e9e9e",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#3fb802",
                },
              }}
            />
            {progress === 100 ? "" : `${progress}%`}
          </Box>
        }
    }

    const handleFetchTestSuiteReport = async (event) => {
      event.stopPropagation();
      try {
        const { data: response, error } = await downloadTestSuiteReport({
          function_name:  "mdt-download-test-suite",
          test_suite_ids: [currentTestSuite.test_suite_id],
          organization: selectedOrgAppDetails.orgName,
          application: selectedOrgAppDetails.appName,
          user_id: sessionStorage.getItem("username"),
        });			

        if (response && response.statusCode === 200) {
          const link = document.createElement("a");
          link.href = response.s3url;
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(link.href);
          document.body.removeChild(link);
          handleClose();
        } else {
          dispatch(
            showSnackbar({
              message: response.message,
              className: "color-error-background width-50",
            })
          );
        }
      } catch (error) {
        console.error("Error downloading test cases Report:", error);
        handleClose();
      }
    }

    const handleViewMoreOption = (event, testSuite) => {
      	event.stopPropagation();
	    setCurrentTestSuite(testSuite)
      	setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      	setAnchorEl(null);
	    setCurrentTestSuite(null);
    };

	const handleAddTestCase = (currentTestSuite) => {    
    navigate("/testsuite/testcase-create?test_suite_id=" + currentTestSuite.test_suite_id + "&test_suite_name=" + currentTestSuite.test_suite_name);
	}

  const viewMoreOptions = () => {
    return <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => {handleAddTestCase(currentTestSuite); handleClose();}}>
        <AddCircle fontSize="small" sx={{mr: "5px"}} className="color-icon"/> Add Test Case
      </MenuItem>
      <MenuItem onClick={(event) => {handleFetchTestSuiteReport(event);}}>
        <CloudDownloadOutlinedIcon fontSize="small" sx={{mr: "5px"}} className="color-icon" /> Download
      </MenuItem>
      <MenuItem onClick={() => {handleEditTestSuite(currentTestSuite); handleClose()}}>
        <Edit className="color-icon" fontSize="small" sx={{mr: "5px"}} />Edit
      </MenuItem>
      <MenuItem onClick={() => {handleDeleteTestSuiteConfirmation(currentTestSuite); handleClose()}}>
        <Delete className="color-icon" fontSize="small" sx={{mr: "5px"}} />Delete
      </MenuItem>
    </Menu>
  }

	const handlecloseCloneConfirmationModal = () => {
		setOpenCloneConfirmationModal(false);
		setCloneTestSuite(null)
	}

  return (
    <>
      {viewMoreOptions()}
      <CloneConfirmationModal
        open={openCloneConfirmationModal}
        cloneTestSuite={cloneTestSuite}
        handleClose={handlecloseCloneConfirmationModal}
      />

      {filteredTestSuites.map((testSuite, index) => (
        <Accordion
          key={index}
          onClick={() => handleAccordionClick(testSuite.test_suite_id)}
          expanded={openedAccordion === testSuite.test_suite_id}
          disableGutters
          sx={{
            "&:before": {
              display: "none",
            },
          }}
          style={{
            border: "1px solid #e0e0e0",
            boxShadow: "none",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            style={{
              backgroundColor: index % 2 === 0 ? "#f2f2f2" : "",
              borderRadius: "8px",
            }}
          >
            <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
              <Box sx={{ width: "16.66%", padding: "2px", textAlign: "center" }}>
                <Typography className={classes["testSuite-header"]} variant="subtitle2">
                  {testSuite.test_suite_id}
                </Typography>
              </Box>
              <Box sx={{ width: "25%", padding: "2px", textAlign: "center" }}>
                <Typography sx={{ 
									wordBreak: "break-word",
								}} className={classes["testSuite-header"]} variant="subtitle2">
                  {testSuite.test_suite_name}
                </Typography>
              </Box>
              <Box sx={{ width: "25%", padding: "2px", textAlign: "center" }}>
                <Typography sx={{ 
									wordBreak: "break-word",
								}} className={classes["testSuite-header"]} variant="subtitle2">
                  {testSuite?.test_suite_desc}
                </Typography>
              </Box>
              <Box sx={{ width: "16.66%", padding: "2px", textAlign: "center" }}>
                <Typography sx={{ 
									wordBreak: "break-word",
								}} className={classes["testSuite-header"]} variant="subtitle2">
                  {testSuite?._modified_by}
                </Typography>
              </Box>
              <Box sx={{ width: "16.66%", padding: "2px", textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
                  <Tooltip title="View Options" arrow placement="top">
                    <IconButton
                      aria-label="View Options"
                      className="color-icon"
                      onClick={(event) => {
                        handleViewMoreOption(event, testSuite);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                  {progressBarForBulkUpload(testSuite)}
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails className={classes.details} onClick={handleClick}>
            <TestsuiteDetails testSuite={testSuite} handleAddTestCase={handleAddTestCase} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

const CloneConfirmationModal = ({open, handleClose, cloneTestSuite}) => {
	const [testSuiteName, setTestSuiteName] = useState("");
  const [testcasesUnderSuite, setTestcasesUnderSuite] = useState([]);
	const [isValid, setIsValid] = useState(true);

	const dispatch = useDispatch();
	const [getTestCase] = useGetTestCaseMutation();
	
	const fetchTestCases = async (testSuiteId) => {
		try {
			dispatch(showLoading());
			const { data: response, error } = await getTestCase({
        function_name: "get-test-cases",
				test_suite_ids: [testSuiteId],
        user_id: sessionStorage.getItem("username"),
			});

			if (response && response.body && response.statusCode === 200) {
				const testCases = response.body.test_cases.map((item) => ({
				id: item.test_case_id,
				}));
				
				setTestcasesUnderSuite(testCases)
				dispatch(closeLoading());
			}
			if (error) throw error;
		} catch (error) {
			console.error("Failed to fetch test cases: ", error);
			dispatch(closeLoading());
		}
	};

	useEffect(() => {
		if(cloneTestSuite !== null){
			fetchTestCases(cloneTestSuite.test_suite_id)
			setTestSuiteName(`copy_of_${cloneTestSuite.name}`)
		}
	}, [cloneTestSuite])

	const handleClone = async () => {
		if(testSuiteName === ""){
			setIsValid(false);
		} else {
			const payload = {
				testSuiteName,
				testSuiteId: cloneTestSuite.test_suite_id,
				testcases: testcasesUnderSuite,
				user_id: sessionStorage.getItem("username"),
			};
			
			fetch(
				"https://ns7wwacggg.execute-api.us-west-2.amazonaws.com/beta/mdt-copy-test-suite",
				{
				method: "POST",
				body: JSON.stringify(payload),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getDataFromStorage("token")}`,
				},
				}
			)
      .then((response) => {			
          if (response.status === 401) {
              dispatch(closeLoading());
              // Unauthorized, redirect to login
              redirectToLogin();
              return;
          }
          return response.json();
      })
			.then((response) => {
			
        if(response.statusCode === 200){
          dispatch(
          showSnackbar({
            message: response.body,
            className: "color-success-background width-50",
          })
          );
          location.reload();
        } else {
          dispatch(
          showSnackbar({
            message: response.body,
            className: "color-error-background width-50",
          })
          );
        }
			})
			.catch((error) => {
			dispatch(
				showSnackbar({
				message: error,
				className: "color-error-background width-50",
				})
			);
			});
		}
	}

	return <Modal
	open={open}
	onClose={handleClose}
	aria-labelledby="modal-modal-title"
	aria-describedby="modal-modal-description"
  >
	<Box sx={cloneModalstyle}>
	  <Typography id="modal-modal-title" variant="h6" component="h2">
      Clone Confirmation
	  </Typography>
	  
	  <TextField
          id="Test Suite Name"
          label="Test Suite Name"
          variant="standard"
          margin="dense"
          fullWidth
          required
          name="testSuiteName"
          value={testSuiteName}
          inputProps={{ style: { textTransform: "uppercase" } }}
          onChange={(e) => {
            setTestSuiteName(e.target.value)
            setIsValid(true);
          }}
          error={!isValid}
          helperText={!isValid ? "Test suite name should not be empty" : ""}
          sx={{
            "& .MuiFormLabel-root": {
              color: !isValid ? "rgba(0, 0, 0, 0.6)" : "",
            },
            "& .MuiFormLabel-asterisk": {
              color: "#FF0000",
            },
          }}
    	/>
		
		<Grid container style={{display: "flex", justifyContent: "flex-end", marginTop: "15px"}}>
			<Button variant="outlined" color="success" onClick={handleClose}>
			Close
			</Button>
			<Button variant="contained" sx={{backgroundColor: "#0ea5e9  !important", ml: "5px"}} type="button" onClick={handleClone}>
			clone
			</Button>
		</Grid>
	</Box>
  </Modal>
}