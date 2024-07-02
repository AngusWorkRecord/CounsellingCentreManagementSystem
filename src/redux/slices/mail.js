import keyBy from 'lodash/keyBy';
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
  mails: { byId: {}, allIds: [] },
  labels: [],
  mailTemplates:[],
  mailTemplateByID:[],
  returnReviewMailTemplate:[],
  mailDefault:[],
  emailPlaceholder:[],
  filterMail:[],
  returnReviewAction: []
};

const slice = createSlice({
  name: 'mail',
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

    // GET LABELS
    getLabelsSuccess(state, action) {
      state.isLoading = false;
      state.labels = action.payload;
    },

    // GET MAILS
    getMailsSuccess(state, action) {
      const mails = action.payload;

      state.isLoading = false;
      state.mails.byId = keyBy(mails, 'id');
      state.mails.allIds = Object.keys(state.mails.byId);
    },

    // GET MAIL
    getMailSuccess(state, action) {
      const mail = action.payload;

      state.mails.byId[mail.id] = mail;
      if (!state.mails.allIds.includes(mail.id)) {
        state.mails.allIds.push(mail.id);
      }
    },

    getMailsTemplateSuccess(state, action) {
      state.isLoading = false;
      state.mailTemplates = action.payload;
    }, 

    getEmailPlaceHolderOptionsSuccess(state, action) {
      state.isLoading = false;
      state.emailPlaceholder = action.payload;
    },

    getDefaultMailsTemplateSuccess(state, action) {
      state.isLoading = false;
      state.mailDefault = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getLabels() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/mail/labels');
      dispatch(slice.actions.getLabelsSuccess(response.data.labels));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getMails(params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/mail/mails', { params });
      dispatch(slice.actions.getMailsSuccess(response.data.mails));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getMail(mailId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/mail/mail', {
        params: { mailId },
      });
      dispatch(slice.actions.getMailSuccess(response.data.mail));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


// ----------------------------------------------------------------------=
export function getMailsTemplate() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await fetch(
        `${url}Paper_EmailTemplate_ViewTemplateByID?PROJECTID=${PROJECTID}&EMAILTEMPLATEID=${0}&ISEDITTEMPLATE=${1}&PAPERID=${0}&TASKID=${0}`
      )
      const json = await response.json();
      const data = JSON.parse(json);

      if (data[0].ReturnVal === 1) {
         dispatch(slice.actions.getMailsTemplateSuccess(JSON.parse(data[0].ReturnData)));
      }
      else {
         dispatch(slice.actions.hasError(JSON.parse(data[0])));
      }

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getEmailPlaceHolderOptions() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      console.log(`${url}General_ViewEmailPlaceholder`)
      const response = await fetch(
        `${url}General_ViewEmailPlaceholder`
      )
      const json = await response.json();
      const data = JSON.parse(json);

      if (data[0].ReturnVal === 1) {
         dispatch(slice.actions.getEmailPlaceHolderOptionsSuccess(JSON.parse(data[0].ReturnData)));
      }
      else {
         dispatch(slice.actions.hasError(JSON.parse(data[0])));
      }

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getDefaultMailsTemplate() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await fetch(
        `${url}General_ViewEmailSetting`
      )
      const json = await response.json();
      const data = JSON.parse(json);

      if (data[0].ReturnVal === 1) {
         dispatch(slice.actions.getDefaultMailsTemplateSuccess(JSON.parse(data[0].ReturnData)));
      }
      else {
         dispatch(slice.actions.hasError(JSON.parse(data[0])));
      }

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}