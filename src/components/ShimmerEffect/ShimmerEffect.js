import * as classes from "./ShimmerEffect.module.css";
import React from "react";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

export function ContentShimmer() {
  return (
    <Box p={2}>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <Skeleton variant="rounded" width={200} height={20} />
        <Skeleton variant="rounded" width={270} height={50} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={40} />
      </Stack>
    </Box>
  );
}

export function InsightsShimmer() {
  return (
    <Box p={2}>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <Skeleton variant="rounded" width="100%" height={180} />
      </Stack>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} />
        </div>
      </Stack>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ marginRight: 1 }} />
        </div>
      </Stack>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 1 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 2 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 3 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 4 */}
          <Skeleton variant="rounded" width={80} height={40} /> {/* Tab 5 */}
        </div>
        <div style={{ marginTop: "20px" }}>
          <Skeleton variant="rounded" width="100%" height={200} /> {/* Tab content */}
        </div>
      </Stack>
    </Box>
  );
}

export function NewQuestionShimmer() {
  return (
    <Box p={2}>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ marginRight: 1 }} />
        </div>
      </Stack>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 1 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 2 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 3 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 4 */}
          <Skeleton variant="rounded" width={80} height={40} /> {/* Tab 5 */}
        </div>
        <div style={{ marginTop: "20px" }}>
          <Skeleton variant="rounded" width="100%" height={200} /> {/* Tab content */}
        </div>
      </Stack>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ marginRight: 1 }} />
        </div>
      </Stack>
      <Stack spacing={1} style={{ marginTop: "20px" }}>
        <div style={{ display: "flex" }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ marginRight: 2 }} />
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 1 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 2 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 3 */}
          <Skeleton variant="rounded" width={80} height={40} sx={{ marginRight: 1 }} /> {/* Tab 4 */}
          <Skeleton variant="rounded" width={80} height={40} /> {/* Tab 5 */}
        </div>
        <div style={{ marginTop: "20px" }}>
          <Skeleton variant="rounded" width="100%" height={200} /> {/* Tab content */}
        </div>
      </Stack>
    </Box>
  );
}

export function NewChatShimmer() {
  return (
    <div className={classes.root}>
      <Container>
        <Paper className={classes.paper} elevation={0} sx={{ textAlign: "center" }}>
          <Skeleton variant="rounded" width={284} height={53} sx={{ margin: 2 }} />
          <Skeleton variant="rounded" width={304} height={27} sx={{ margin: 2 }} />
          <Skeleton variant="rounded" width={521} height={18} sx={{ margin: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
            </Grid>
            <Grid item xs={4}>
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
            </Grid>
            <Grid item xs={4}>
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
              <Skeleton variant="rounded" width={210} height={62} sx={{ margin: 2 }} />
            </Grid>
          </Grid>
          <Skeleton variant="rounded" width={700} height={50} sx={{ margin: 2 }} />
        </Paper>
      </Container>
    </div>
  );
}

export function LandingPageShimmer() {
  return (
    <div style={{ paddingLeft: "24px", paddingRight: "24px" }}>
      <Skeleton variant="rounded" width={350} height={150} sx={{ mb: "30px" }} />
      <Skeleton variant="rounded" width={389} height={48} sx={{ mb: "10px" }} />
      <Skeleton variant="rounded" width={108} height={30} />
      <div style={{ marginTop: "40px", marginBottom: "80px" }}>
        <Box style={{ marginTop: "24px", marginBottom: "24px" }}>
          <Grid
            container
            spacing={2}
            style={{
              display: "flex",
              flexFlow: "wrap",
              marginTop: "-16px",
              width: "calc(100% + 16px)",
              marginLeft: "-16px",
            }}
          >
            <Grid item xs={12} sm={4} marginBottom={"30px"}>
              <Skeleton
                variant="rounded"
                style={{
                  height: "100%",
                  minHeight: "280px",
                  maxHeight: "100%",
                  padding: "30px",
                  boxShadow: "none",
                  borderRadius: "10px",
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Skeleton
                variant="rounded"
                style={{
                  height: "100%",
                  minHeight: "280px",
                  maxHeight: "100%",
                  padding: "30px",
                  boxShadow: "none",
                  borderRadius: "10px",
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Skeleton
                variant="rounded"
                style={{
                  height: "100%",
                  minHeight: "280px",
                  maxHeight: "100%",
                  padding: "30px",
                  boxShadow: "none",
                  borderRadius: "10px",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
}

export function LoginShimmer() {
  return (
    <div className={classes.root}>
      <Container>
        <Paper elevation={0} className={classes.paper} sx={{ textAlign: "center" }}>
          <Skeleton variant="rounded" width={220} sx={{ margin: 2 }} height={245} />
          <Skeleton variant="rounded" width={325} sx={{ margin: 2 }} height={27} />
          <Skeleton variant="rounded" width={72} sx={{ margin: 2 }} height={36} />
        </Paper>
      </Container>
    </div>
  );
}

export function HomeShimmer() {
  return (
    <Stack direction="row" spacing={2} style={{ marginLeft: "30px" }}>
      <Stack spacing={1}>
        <Skeleton variant="rounded" width={150} height={40} sx={{ marginLeft: "100px" }} />
      </Stack>
      <Box>
        <Skeleton variant="rounded" width={150} height={40} />
      </Box>
    </Stack>
  );
}

export function Subheader() {
  return (
    <Stack spacing={1} style={{ margin: "0px 1px 0 1px", padding: "5px 10px 5px 10px" }}>
      <Skeleton variant="rounded" width="100%" height={59} />
    </Stack>
  );
}

export function TestSuiteHistoryShimmer() {
  return (
    <Paper elevation={0} style={{ margin: "0px 15px 0 15px" }}>
      <Grid item xs={12} sm={6} padding={"0"} display={"flex"} justifyContent={"space-between"} alignItems={"center"} marginBottom={"10px"}>
        <Skeleton variant="rounded" width={289} height={40} />
        <Skeleton variant="rounded" width={134} height={30} />
      </Grid>
      <Stack spacing={0.5}>
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={35} />
        <Skeleton variant="rounded" width="100%" height={35} />
        <Skeleton variant="rounded" width="100%" height={35} />
        <Skeleton variant="rounded" width="100%" height={35} />
        <Skeleton variant="rounded" width="100%" height={35} />
        <Skeleton variant="rounded" width="100%" height={54} />
      </Stack>
    </Paper>
  );
}

export function TestSuiteDetailsShimmer() {
  return (
    <Paper elevation={0} style={{ margin: "0px 15px 0 15px" }}>
      <Grid item xs={12} sm={6} display={"flex"} justifyContent={"space-between"} alignItems={"center"} marginBottom={"10px"} gap={2}>
        <Skeleton
          variant="rounded"
          width={289}
          height={40}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        />
        <Skeleton variant="rounded" width={150} height={40} />
      </Grid>
      <Stack spacing={0.5}>
        <Skeleton variant="rounded" width="100%" height={105} />
      </Stack>
    </Paper>
  );
}

export function TestCaseShimmer() {
  return (
    <Paper elevation={3} style={{ margin: "0px 15px 70px 15px" }}>
      <Paper style={{ marginBottom: "20px", padding: "8px 0px 16px 16px" }}>
        <Skeleton variant="rounded" width={973} height={619} />
      </Paper>
    </Paper>
  );
}

export function ReleasesAndCycleShimmer() {
  return (
    <Paper
      elevation={3}
      style={{
        padding: "10px",
        margin: "0px 15px 8px 15px",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8} container alignItems="center">
          <Skeleton variant="rounded" width={141} height={30} style={{ marginRight: "10px" }} />
          <Skeleton variant="rounded" width={126} height={30} />
        </Grid>
        <Grid item xs={4} container justifyContent="flex-end">
          <Skeleton variant="rounded" width={265} height={40} />
        </Grid>
      </Grid>
      <Box style={{ margin: "5px", display: "flex" }}>
        <Skeleton width={231} height={24} sx={{ marginLeft: 1 }}>
          <Typography>.</Typography>
        </Skeleton>
        <Skeleton width={90} height={25} sx={{ marginLeft: 1 }}>
          <Typography>.</Typography>
        </Skeleton>
        <Skeleton width={116} height={25} sx={{ marginLeft: 1 }}>
          <Typography>.</Typography>
        </Skeleton>
      </Box>

      <Grid container spacing={2}>
        <Grid
          item
          lg={4}
          md={6}
          sm={12}
          style={{
            marginTop: "16px",
            overflowY: "auto",
            height: "calc(100vh - 330px)",
            paddingTop: "0",
          }}
        >
          <Stack spacing={2}>
            <Skeleton variant="rounded" width={293} height={45} style={{ margin: "4px 0px 6px 10px", borderRadius: "8px" }} />
            <Skeleton variant="rounded" width={293} height={45} style={{ margin: "4px 0px 6px 10px", borderRadius: "8px" }} />
            <Skeleton variant="rounded" width={293} height={45} style={{ margin: "4px 0px 6px 10px", borderRadius: "8px" }} />
            <Skeleton variant="rounded" width={293} height={45} style={{ margin: "4px 0px 6px 10px", borderRadius: "8px" }} />
            <Skeleton variant="rounded" width={293} height={45} style={{ margin: "4px 0px 6px 10px", borderRadius: "8px" }} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

export function TestCycleAndCasesShimmer() {
  return (
    <>
      <Paper elevation={0} style={{ margin: "0px 15px 0 15px" }}>
        <Grid container>
          <Skeleton width={84} height={24} />
          <Skeleton width={149} height={24} sx={{ marginLeft: 1 }} />
        </Grid>
        <Grid container alignItems="center" justifyContent="space-between" marginTop={"10px"}>
          <Grid item xs={12} sm={6} md={4}>
            <Skeleton variant="rounded" width={289} height={40}></Skeleton>
          </Grid>
          <Grid item xs={12} sm={6} md={8} container justifyContent="flex-end" spacing={1}>
            <Grid item>
              <Skeleton variant="rounded" width={134} height={30} />
            </Grid>
            <Grid item>
              <Skeleton variant="rounded" width={64} height={30} />
            </Grid>
            <Grid item>
              <Skeleton variant="rounded" width={64} height={30} />
            </Grid>
          </Grid>
        </Grid>
        <div style={{ height: 307, width: "100%", marginTop: 10 }}>
          <Stack spacing={1}>
            <Skeleton variant="rounded" width="100%" height={56} />
            <Skeleton variant="rounded" width="100%" height={39} />
            <Skeleton variant="rounded" width="100%" height={39} />
            <Skeleton variant="rounded" width="100%" height={39} />
            <Skeleton variant="rounded" width="100%" height={39} />
            <Skeleton variant="rounded" width="100%" height={39} />
            <Skeleton variant="rounded" width="100%" height={54} />
          </Stack>
        </div>
      </Paper>
    </>
  );
}

export function ExecuteHistoryShimmer() {
  return (
    <Stack p={"0 20px"}>
      <Grid item xs={12} sm={6} padding={"0"} display={"flex"} justifyContent={"space-between"} alignItems={"center"} marginBottom={"20px"}>
        <Skeleton variant="rounded" width={289} height={40} />
        <Stack alignItems="center" justifyContent="flex-end">
          <Skeleton variant="rounded" width={64} height={32} />
        </Stack>
      </Grid>
      <Stack marginTop={"20px"} spacing={1}>
        <Skeleton variant="rounded" width="100%" height={40} />
        <Skeleton variant="rounded" width="100%" height={48} />
        <Skeleton variant="rounded" width="100%" height={48} />
        <Skeleton variant="rounded" width="100%" height={48} />
        <Skeleton variant="rounded" width="100%" height={48} />
        <Skeleton variant="rounded" width="100%" height={48} />
      </Stack>
    </Stack>
  );
}
