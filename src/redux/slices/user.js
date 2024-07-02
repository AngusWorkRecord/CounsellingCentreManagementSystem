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
  expertises: [],
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

    // GET EXPERTISES
    getExpertisesSuccess(state, action) {
      state.isLoading = false;
      state.expertises = action.payload;
    },
  
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { onOpenModal, onCloseModal, selectUser, selectRange } = slice.actions;
// ----------------------------------------------------------------------

export function getExpertises() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await fetch(`${url}General_ViewExpertise`);
      const json = await response.json();
      const data = JSON.parse(json)[0];
      if (data && data.ReturnVal === 1) {
        dispatch(slice.actions.getExpertisesSuccess(JSON.parse(data.ReturnData)));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

