import { combineReducers } from 'redux';
import rest_client from '../rest_client';

const default_state = {
  by_id: {},
  is_fetching: false,
  error: ""
};

export default function itineraries(state = default_state, action) {
  switch (action.type) {
    case rest_client.events.itineraries.actionSuccess:
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
    case rest_client.events.itineraries.actionFail:
      return {
        ...state,
        is_fetching: false,
        error: action.error.message
      };
    break;
    default:
      return state;
    break;
  }
}
