import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: {
    isSidebarOpen: true,
    isLoading: false,
    snackbar: {
      open: false,
      message: "",
      className: "",
      timer: 4000,
      mandateClose: false,
    },
    confirmDialog: {
      open: false,
      titleText: "",
      innerText: "",
      buttonText: {
        confirm: "Confirm",
        cancel: "Cancel",
      },
      onConfirm: null,
      onCancel: null,
    },
  },
  reducers: {
    toggleMenu: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeMenu: (state) => {
      state.isSidebarOpen = false;
    },
    showSnackbar: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload?.message;
      state.snackbar.className = action.payload?.className;
      state.snackbar.timer =
        action.payload?.timer !== undefined ? action.payload.timer : 4000;
      state.snackbar.mandateClose =
        action.payload?.mandateClose !== undefined
          ? action.payload.mandateClose
          : false;
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    showLoading: (state) => {
      state.isLoading = true;
    },
    closeLoading: (state) => {
      state.isLoading = false;
    },
    openDialog: (state, action) => {
      state.confirmDialog.open = true;
      state.confirmDialog.titleText = action.payload?.titleText;
      state.confirmDialog.innerText = action.payload?.innerText;
      state.confirmDialog.onConfirm = action.payload.onConfirm;
      state.confirmDialog.onCancel = action.payload.onCancel;
      state.confirmDialog.buttonText = action.payload.buttonText;
    },
    closeDialog: (state) => {
      state.confirmDialog.open = false;
      state.confirmDialog.onConfirm = null;
      state.confirmDialog.onCancel = null;
    },
  },
});

export const {
  toggleMenu,
  closeMenu,
  showSnackbar,
  hideSnackbar,
  showLoading,
  closeLoading,
  openDialog,
  closeDialog,
} = appSlice.actions;
export default appSlice.reducer;
