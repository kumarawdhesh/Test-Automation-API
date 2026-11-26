import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Typography } from '@mui/material';
import { Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';

const RenderMultiStepTable = ({steps = [], formIndex, handleDeleteStep, moveStep, stepExecutionType}) => {    
    if (!steps || steps.length === 0) {
      return <Typography variant="body2" sx={{ mt: 2 }}>No steps added yet.</Typography>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Seq.</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Application</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Env</TableCell>
              {/* <TableCell sx={{ fontWeight: "bold" }}>Payload Type</TableCell> */}
              <TableCell sx={{ fontWeight: "bold" }}>Request Payload</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", minWidth: 150}}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {steps.map((s, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === steps.length - 1;
              const payloadDisplay = s.payloadType === "json"
                ? (s.payload || "")
                : (Array.isArray(s.formData) ? JSON.stringify(s.formData, null, 2) : "");

              return (
                <TableRow key={s.id || `${idx}-${s.sequence || ""}`}>
                  <TableCell>{s.sequence ?? idx + 1}</TableCell>
                  <TableCell>{s.application}</TableCell>
                  <TableCell>{s.env}</TableCell>
                  {/* <TableCell>{s.payloadType}</TableCell> */}
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={<pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{payloadDisplay}</pre>} placement="top">
                      <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {payloadDisplay}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {/* <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEditStep(s, formIndex)} color="primary">
                        <Launch fontSize="small" />
                      </IconButton>
                    </Tooltip> */}

                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteStep(formIndex, s.id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {stepExecutionType === "sync" && (
                        <>
                            <Tooltip placement="left" title="Move up">
                                <span>
                                    <IconButton
                                    size="small"
                                    onClick={() => moveStep(formIndex, idx, idx - 1)}
                                    disabled={isFirst}
                                    >
                                        <ArrowUpward fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip placement="right" title="Move down">
                                <span>
                                    <IconButton
                                    size="small"
                                    onClick={() => moveStep(formIndex, idx, idx + 1)}
                                    disabled={isLast}
                                    >
                                        <ArrowDownward fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

export default RenderMultiStepTable;