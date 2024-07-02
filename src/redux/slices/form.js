import sum from 'lodash/sum';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import { devServer, devServer_somee } from '../globalSettings';

// ----------------------------------------------------------------------

const initialState = {
    isLoading: false,
    error: null,
    formTypes: [],

};

const slice = createSlice({
    name: 'formStructure',
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

        // GET CONFERENCE EVENTS 
        getFormTypes(state, action) {
            state.isLoading = false;
            state.formTypes = action.payload;
        },


    },
});

// Reducer
export default slice.reducer;

// Actions
export const {
    getFormTypes,
} = slice.actions;

// ----------------------------------------------------------------------

export function fetchFormTypes() {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await fetch(`${devServer}General_ViewAnswerType`)
            const json = await response.json();
            const data = JSON.parse(json)[0];
            console.log(data)
            if (data && data.ReturnVal === 1) {
                dispatch(slice.actions.getFormTypes(JSON.parse(data.ReturnData)));
            } else {
                dispatch(slice.actions.hasError(JSON.parse(data.ReturnData)[0].ReturnSqlError));
            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}



// ----------------------------------------------------------------------

