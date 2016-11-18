import { combineReducers } from 'redux';
import rest_client from '../rest_client';

const default_state = {
  isFetching: false,
  user: {
    id: null,
    role: 'anon'
  },
  token: null,
  error: ''
};

export default function auth(state = default_state, action) {
  switch (action.type) {
    case rest_client.events.login.actionFetch:
      return {
        ...state,
        isFetching: true,
        error: ""
      };
    case rest_client.events.login.actionSuccess:
      return {
        ...state,
        isFetching: false,
        user: {
          ...state.user,
          ...action.data.user
        },
        token: action.data.token,
        error: ""
      };
    break;
    case rest_client.events.login.actionFail:
      return {
        ...state,
        isFetching: false,
        error: action.error.message
      };
    break;
    default:
      return state;
  }
}
