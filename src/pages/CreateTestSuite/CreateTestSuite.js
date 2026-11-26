import * as React from "react";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  IconButton,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  FormLabel,
  Button,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as classes from "./CreateTestSuite.module.css";

// TODO remove, this demo shouldn't need to reset the theme.

export default function CreateTestSuite() {
  const [Ttype, setTtype] = React.useState("");
  const [Ctype, setCtype] = React.useState("");
  const [SDB, setSDB] = React.useState("");
  const [TDB, setTDB] = React.useState("");
  const [SST, setSST] = React.useState("");
  const [TST, setTST] = React.useState("");
  const [TS, setTS] = React.useState("");
  const [KC, setKC] = React.useState("");
  const navigate = useNavigate()
  const handleChange = (event) => {
    setTtype(event.target.value);
    setCtype(event.target.value);
    setSDB(event.target.value);
    setTDB(event.target.value);
    setSST(event.target.value);
    setTST(event.target.value);
    setTS(event.target.value);
    setKC(event.target.value);
  };

  const handleRouteChange = (path) => {
    navigate(`/${path}`)
  }

  return (
    <Container>
      <div className={classes.body}>
        <p>
          <FormControl>
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "left",
              }}
            >
              <Box
                component="form"
                // onSubmit={handleSubmit}
                // noValidate
                sx={{ mt: 1 }}
              >
                {/* <FormLabel>TestSuite Name</FormLabel> */}
                <TextField
                  margin="2%"
                  required
                  variant="standard"
                  //fullWidth
                  id="Test Suite Name"
                  label="Test Suite Name"
                  name="Test Suite Name"
                //autoComplete="email"
                //autoFocus
                />
                {/* <FormLabel>TestCase Name</FormLabel>
                <TextField
                  margin="2%"
                  required
                  id="Test Case Name"
                  label="Test Case Name"
                  name="Test Case Name"
                  //autoComplete="email"
                  //autoFocus
                /> */}
              </Box>
            </Box>
          </FormControl>
        </p>
        <p>
          <Button variant="outlined" onClick={() => handleRouteChange("testcase-create")}>
            + Add TestCase
          </Button>
          <Button variant="outlined" onClick={() => handleRouteChange("testcase-list")}>
            + Existing TestCase
          </Button>
          <Button variant="outlined" onClick={() => handleRouteChange("testcase-create")}>
            Submit
          </Button>
        </p>
        {/* <Button
          type="submit"
          //fullWidth
          //variant="contained"
          alignItems="left"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </Button>
        <Button
          type="submit" //variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Reset
        </Button> */}
      </div>
    </Container>
  );

  <Container component="main" maxWidth="xs"></Container>;
}
