import { AddCircle, Delete } from '@mui/icons-material';
import { Box, Button, FormControl, FormControlLabel, MenuItem, Modal, Radio, RadioGroup, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
function MultiStepModal({
  openStepModal, 
  handleCloseStepModal, 
  currentStepData, 
  handleStepModalChange,
  handleSaveStep, 
  handleFormDataChange, 
  addFormDataRow, 
  removeFormDataRow, // Assuming ReactJson is imported
  styleModal,
}) {
  const storedAppDetails = sessionStorage.getItem("multi_step_app_details");

  const [ availableParams, setAvailableParams ] = useState([]);  

  useEffect(() => {
    if (currentStepData.application && storedAppDetails) {
      try {
        const appDetails = JSON.parse(storedAppDetails);
        const selectedApp = appDetails.find(app => app.name === currentStepData.application);
        setAvailableParams(selectedApp ? selectedApp.available_params : []);

      } catch (e) {
        console.error("Error parsing multi_step_app_details from sessionStorage", e);
        setAvailableParams([]);
      }
    }
  }, [currentStepData]);

  const getApplicationOptions = () => {
    
    if (storedAppDetails) {
      try {
        const appDetails = JSON.parse(storedAppDetails);
        return appDetails.map(app => app.name);
      } catch (e) {
        console.error("Error parsing multi_step_app_details from sessionStorage", e);
        return [];
      }
    }
    return [];
  };

  const getEnvironmentOptions = () => {
    if (storedAppDetails) {
      try {
        const appDetails = JSON.parse(storedAppDetails);
        const selectedApp = appDetails.find(app => app.name === currentStepData.application);
        return selectedApp ? selectedApp.environments : []; 
      } catch (e) {
        console.error("Error parsing multi_step_app_details from sessionStorage", e);
        return [];
      }
    }
    return [];
  };

    return <Modal
      open={openStepModal}
      onClose={handleCloseStepModal}
      aria-labelledby="step-modal-title"
      aria-describedby="step-modal-description"
    >
      <Box sx={{ ...styleModal, width: 600 }}>
        <h2 id="step-modal-title">Add Test Step</h2>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            required
            label="Application"
            name="application"
            value={currentStepData.application}
            onChange={handleStepModalChange}
            fullWidth
            size="small"
          >
            {getApplicationOptions().map((app, i) => (
              <MenuItem key={app + i} value={app}>{app}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            required
            label="Environment"
            name="env"
            value={currentStepData.env}
            onChange={handleStepModalChange}
            fullWidth
            size="small"
          >
            {getEnvironmentOptions().map((env, i) => (
              <MenuItem key={env + i} value={env}>{env}</MenuItem>
            ))}
          </TextField>

          <Box>
            <FormControl component="fieldset">
              <RadioGroup row name="payloadType" value={currentStepData.payloadType} onChange={handleStepModalChange}>
                <FormControlLabel value="json" control={<Radio />} label="JSON Payload" />
                <FormControlLabel value="form-data" control={<Radio />} label="Form Data" />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box>
            {currentStepData.payloadType === 'json' ? ( // Removed the toggle between JSON editor and text field
              <TextField 
                required
                label="JSON Payload" 
                multiline 
                rows={6} 
                name="payload" 
                fullWidth 
                value={currentStepData.payload} 
                onChange={(e) => handleStepModalChange({ target: { name: 'payload', value: e.target.value } })} />
            ) : ( // Kept the form data section as is
              <>
                {currentStepData.formData.map((row, idx) => (
                  <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                    <TextField
                      select
                      label="Key"
                      name="key"
                      value={row.key}
                      onChange={(e) => handleFormDataChange(idx, e)}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      {availableParams.map((param, i) => (
                        <MenuItem key={param + i} value={param}>{param}</MenuItem>
                      ))}
                    </TextField>
                    <TextField label="Value" name="value" value={row.value} onChange={(e) => handleFormDataChange(idx, e)} size="small" sx={{ flex: 1 }} />
                    <Button onClick={() => removeFormDataRow(idx)} color="error"><Delete /> </Button>
                  </Box>
                ))}
                <Button size='small' variant='outlined' startIcon={<AddCircle />} onClick={addFormDataRow}>Add Row</Button>
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseStepModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStep}>Save Step</Button>
        </Box>
      </Box>
    </Modal>
}

export default MultiStepModal;