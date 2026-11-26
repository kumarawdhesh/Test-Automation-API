import { Typography, Box } from "@mui/material";

export const TestSuiteHistoryTableHeader = () => {
  const headerStyle = {
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "center",
    paddingBottom: "20px",
    // Optional: border for debugging
    // border: "1px solid #444",
  };

  const itemStyle = {
    flex: "0 0 auto", // Don't grow, don't shrink, base size auto
    padding: "2px", // Add some padding around each item
    textAlign: "center",
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#b2b2b2",
        marginBottom: "10px",
        paddingTop: "10px",
        display: "flex", // Use Flexbox
        flexDirection: "row", // Arrange items in a row
        justifyContent: "space-between", // Distribute space evenly
      }}
    >
      <Box sx={{ ...itemStyle, width: "16.66%" }}> {/* xs=2/12 */}
        <Typography sx={headerStyle}>Test Suite Id</Typography>
      </Box>
      <Box sx={{ ...itemStyle, width: "25%" }}> {/* xs=3/12 */}
        <Typography sx={headerStyle}>Test Suite Name</Typography>
      </Box>
      <Box sx={{ ...itemStyle, width: "25%" }}> {/* xs=3/12 */}
        <Typography sx={headerStyle}>Test Suite Description</Typography>
      </Box>
      <Box sx={{ ...itemStyle, width: "16.66%" }}> {/* xs=2/12 */}
        <Typography sx={headerStyle}>Created / Modified By</Typography>
      </Box>
      <Box sx={{ ...itemStyle, width: "16.66%" }}> {/* xs=2/12 */}
        <Typography sx={headerStyle}>Action</Typography>
      </Box>
    </Box>
  );
};
