import { combineReducers } from 'redux';
import {LOGIN_SUCCESS, ACTIVE_USER_CHANGED} from '../actions';
import rest_client from '../rest_client';
import _ from 'lodash';

const default_state = {
  by_id: {},
  active_user: null,
  is_fetching: false,
  error: ""
};

export default function users(state = default_state, action) {
  switch (action.type) {
    case rest_client.events.users.actionSuccess:
      return {
        ...state,
        by_id: {
          ..._.pickBy(state.by_id, it => !(it.id in action.data.deleted)),
          ...action.data.new
        },
        is_fetching: false,
        error: ""
      }
    break;
    case rest_client.events.users.actionFail:
      return {
        ...state,
        is_fetching: false,
        error: action.error.message
      };
    break;
    case ACTIVE_USER_CHANGED:
    case LOGIN_SUCCESS:
      return {
        ...state,
        by_id: {
          ...state.by_id,
          [action.user.id]: action.user
        },
        active_user: action.user.id
      }
    break;
    default:
      return state;
    break;
  }
}
