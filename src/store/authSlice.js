import { createSlice } from '@reduxjs/toolkit'
import { getUserFromStorage } from '../utils/utility';
import { DEMO_MODE } from '../../environment';
let user = getUserFromStorage()

if (DEMO_MODE) {
  user = {
    username: 'local-explorer@localhost',
    first_name: 'Local',
    last_name: 'Explorer',
    full_name: 'Local Explorer',
    token: '',
    access: true,
  };
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: user },
  reducers: {
    setCredentials: (state, { payload: { user } }) => {
      state.user = user;
    },
    accessUpdate: (state, { payload: { user } }) => {
      state.user.access = user.access;
    },
    clearCredentials: (state) => {
      state.user = {
        "username": "",
        "first_name": "",
        "last_name": "",
        "full_name" : "",
        "token": "",
        "access" : false
      };
    },
  },
})

export const { setCredentials , clearCredentials ,accessUpdate } = slice.actions

export default slice.reducer

export const selectCurrentUser = (state) => state.auth.user
