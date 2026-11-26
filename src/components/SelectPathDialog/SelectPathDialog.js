import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useGetAndCreateJaasFolderMutation } from "../../store/mdtSlice";
import { showSnackbar } from "../../store/appSlice";
import { useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const SelectPathDialog = ({
  openPathDialog,
  setOpenPathDialog,
  getJaasfolder,
  setSelectedPaths,
  setJassFolder,
}) => {
  const dispatch = useDispatch();
  const [showNewFolderTextField, setShowNewFolderTextField] = useState(false);
  const [createFolderName, setCreateFolderName] = useState("");
  const [getAndCreateJaasFolder] = useGetAndCreateJaasFolderMutation();
  const [showTextFieldForId, setShowTextFieldForId] = useState(null);
  const [showMenuOptions, setShowMenuOptions] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMoreOptionsClick = (folderId, event) => {
    event.stopPropagation();
    setShowNewFolderTextField(false);
    setShowMenuOptions(folderId);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClosePathDialog = () => {
    setOpenPathDialog(false);
  };

  const handleFolderClick = (path) => {
    setSelectedPaths(path);
    handleClosePathDialog();
  };

  const handleCloseTextField = (e) => {
    e.stopPropagation();
    setShowTextFieldForId(null);
    setShowNewFolderTextField(false);
    setCreateFolderName("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setShowNewFolderTextField(false);
      setShowTextFieldForId(null);
      createJaasFolder();
    }
  };

  const createJaasFolder = async () => {
    try {
      if (createFolderName !== "") {
        const { data: response, error } = await getAndCreateJaasFolder({
          folder_name: createFolderName,
          action: "create",
          parentId: showTextFieldForId,
        });
        if (response && response.body && response.statusCode === 200) {
          setJassFolder(response.body.paths);
          dispatch(
            showSnackbar({
              message: response.message,
              className: "color-success-background width-50",
            })
          );
          setCreateFolderName("");
        }
      }
      if (error) throw error;
    } catch (error) {
      console.error("Error creating Jaas Folder:", error);
    }
  };

  const handleAddSubfolder = (folderId) => {
    setShowTextFieldForId(folderId);
    setShowMenuOptions(null);
  };

  const renderFolderStructure = (folders) => {
    return folders.map((folder, index) => (
      <div key={index}>
        <MenuItem
          value={folder.id}
          sx={{ fontSize: "12px" }}
          style={{ justifyContent: "space-between" }}
          onClick={() => handleFolderClick(folder.path)}
        >
          {folder.path.includes("/") ? (
            <>
              <div style={{ display: "flex" }}>
                {folder.path.split("/").map((subfolder, index) => (
                  <div className="subfoldername" key={index}>
                    <span>{index > 0 ? "/" : ""}</span>
                    <span>{subfolder}</span>
                    <br />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <Typography
                variant="subtitle1"
                display="inline"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpandMoreIcon />
                {folder.path}
              </Typography>
            </>
          )}

          <div>
            {showTextFieldForId === folder.id && (
              <TextField
                size="small"
                label="Folder Name"
                sx={{ width: "200px" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={(e) => handleCloseTextField(e)}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoFocus
                onChange={(event) => setCreateFolderName(event.target.value)}
                value={createFolderName}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>
          {showTextFieldForId !== folder.id && (
            <IconButton
              id="basic-button"
              aria-haspopup="true"
              style={{ marginLeft: "auto" }}
              onClick={(event) => handleMoreOptionsClick(folder.id, event)}
            >
              <MoreHorizIcon />
            </IconButton>
          )}
        </MenuItem>
        <Menu
          className="subfolder"
          anchorEl={menuAnchorEl}
          open={showMenuOptions === folder.id}
          onClose={() => setShowMenuOptions(null)}
          sx={{
            mt: "1px",
            "& .MuiMenu-paper": {
              backgroundColor: "rgba(224, 224, 224, 1)",
              color: "black",
            },
          }}
        >
          <MenuItem
            onClick={() => handleAddSubfolder(folder.id)}
            sx={{ fontSize: "10px", paddingTop: "0", paddingBottom: "0" }}
          >
            Add Subfolder
          </MenuItem>
        </Menu>
      </div>
    ));
  };

  return (
    <Dialog
      open={openPathDialog}
      onClose={handleClosePathDialog}
      aria-labelledby="customized-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          overflowX: "hidden",
          maxWidth: "700px",
          width: "700px",
          height: "450px",
        },
      }}
    >
      <DialogTitle
        id="customized-dialog-title"
        sx={{ m: 0, p: 2, fontWeight: 600 }}
      >
        Select Path
      </DialogTitle>
      <DialogContent dividers>
        <Button
          variant="outlined"
          onClick={() => {
            setShowNewFolderTextField(true);
            setShowTextFieldForId(null);
          }}
          sx={{ height: "39px" }}
        >
          + New Folder
        </Button>
        {showNewFolderTextField && (
          <TextField
            sx={{ marginLeft: "5px" }}
            size="small"
            label="Folder Name"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCloseTextField}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            autoFocus
            onChange={(event) => setCreateFolderName(event.target.value)}
            value={createFolderName}
            onKeyDown={handleKeyDown}
          />
        )}
        {renderFolderStructure(getJaasfolder)}
      </DialogContent>
      <DialogActions>
        <Button color="success" onClick={handleClosePathDialog}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectPathDialog;
