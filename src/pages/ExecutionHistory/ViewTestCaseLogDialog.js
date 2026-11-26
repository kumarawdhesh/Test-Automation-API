import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "70%",
    overflow:'scroll',
    height:'90%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ViewTestCaseLogDialog({open, handleClose, selectedTestCaseLog}) {
    const [logs, setLogs] = React.useState([]);

    React.useEffect(() => {
        if(selectedTestCaseLog.length > 0){
            setLogs(selectedTestCaseLog)
        }
    }, [selectedTestCaseLog])

    return (
        <div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Logs
                </Typography>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={"20%"}>Timestamp</TableCell>
                            <TableCell>Message</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, index) => (
                            <TableRow>
                                <TableCell sx={{borderBottom: logs.length -1 === index ? "none" : undefined}}>{log.timestamp}</TableCell>
                                <TableCell sx={{borderBottom: logs.length -1 === index ? "none" : undefined}}>{log.message}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div style={{display: "flex", justifyContent: "right", marginTop: "10px"}}>
                    <Button variant="outlined" color="success" onClick={handleClose}>Close</Button>
                </div>
            </Box>
        </Modal>
        </div>
    );
}
