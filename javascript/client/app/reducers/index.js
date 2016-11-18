import { combineReducers } from 'redux';
import auth from './auth';
import users from './users';
import itineraries from './itineraries';

const app_reducers = {
  auth,
  users,
  itineraries
};

export default app_reducers;
