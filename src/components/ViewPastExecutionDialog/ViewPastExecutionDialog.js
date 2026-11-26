import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, IconButton, Accordion, AccordionSummary, Typography, AccordionDetails, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ExecutionHistoryTableHeader } from "../../pages/ExecutionHistory/ExecutionHistory";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { RenderTestCycles } from "../../pages/ExecutionHistory/RenderTestCycles";

const ViewPastExecutionModel = ({ 
  open, 
  setOpen,  
  // selectedTestCycle,
  selectedTestCycleId,
  sortOrder, 
  location, 
  handleIconClick,
  // filterTestCycles,  
  loading, 
  handleAccordionClick,
  openedAccordion,
  openedTestCycle,
  testCycleListData,
  // setTestCycleListDataPastExecution,
  testCasesListData,
  setTestCasesListData,
  handleOpenDialog,
  openSqlQueryDialog,
  handleFetchTestCaseReport,
  handleFetchTestCycleReport,
  RenderPagination,
  noRowsLabel
  }) => {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [slicedTestCycleData, setSlicedTestCycleData] = useState([]);

    useEffect(() => {

      const slicedData = testCycleListData.slice((page - 1) * pageSize, page * pageSize);
      setSlicedTestCycleData(slicedData);
    }, [page, pageSize, testCycleListData]);

    const handleClose = () => {
      setOpen(false);
      setPage(1);
      setPageSize(5);
      setSlicedTestCycleData([]);
    };

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
      >
        <DialogTitle>
          {`Past Executions of Test Cycle: ${selectedTestCycleId}`}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
              style={{
                background: "#323232",
                justifyContent: "space-between",
                color: "white",
                height: "47px",
                minHeight: 0,
              }}
            >
              <Typography>Execution History</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <ExecutionHistoryTableHeader 
                  sortOrder={sortOrder}
                  location={location}
                  handleIconClick={handleIconClick}
                  showViewPastOption={false}/>

                <RenderTestCycles 
                  // filterTestCycles={filterTestCycles}
                  page={page}
                  pageSize={pageSize}
                  loading={loading}
                  handleAccordionClick={handleAccordionClick}
                  openedTestCycle={openedTestCycle}
                  openedAccordion={openedAccordion}
                  testCycleListData={slicedTestCycleData}
                  testCasesListData={testCasesListData}
                  setTestCasesListData={setTestCasesListData}
                  handleOpenDialog={handleOpenDialog}
                  openSqlQueryDialog={openSqlQueryDialog}
                  handleFetchTestCaseReport={handleFetchTestCaseReport}
                  handleFetchTestCycleReport={handleFetchTestCycleReport}
                  noRowsLabel={noRowsLabel}
                  showViewPastOption={false}/>
              </div>
            </AccordionDetails>
            <RenderPagination page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize}/>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button style={{ border: "1px solid rgb(63, 184, 2)", color: "black" }} onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
};

export default ViewPastExecutionModel;
 
