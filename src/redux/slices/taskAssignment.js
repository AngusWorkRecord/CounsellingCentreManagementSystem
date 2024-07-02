import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import { ServerConfiguration } from '../../utils/serverConfig';

// ----------------------------------------------------------------------

const url = ServerConfiguration.testingServerUrl;
const PROJECTID = 1;
const initialState = {
  isLoading: false,
  error: null,
  taskStatus: [],
};

const slice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET TASK STATUS
    getTaskStatusSuccess(state, action) {
      state.isLoading = false;
      state.taskStatus = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// Actions
export const { onOpenModal, onCloseModal, selectUser, selectRange } = slice.actions;

// ----------------------------------------------------------------------

export function getTaskStatus() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await fetch(`${url}Paper_Task_ViewTaskStatus`);
      const json = await response.json();
      const data = JSON.parse(json)[0];
      if (data && data.ReturnVal === 1) {
        dispatch(slice.actions.getTaskStatusSuccess(JSON.parse(data.ReturnData)));
      } else {
        dispatch(slice.actions.hasError(JSON.parse(data.ReturnData)[0].ReturnSqlError));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}



