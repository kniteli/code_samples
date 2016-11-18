import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';
import routes from './routes';
import reducers from './reducers';
import rest_client from './rest_client';

//redux store and router init
const router_middleware = routerMiddleware(browserHistory);
let createStoreWithMiddleware = applyMiddleware(thunkMiddleware, router_middleware)(createStore);
const store = createStoreWithMiddleware(combineReducers({
  ...rest_client.reducers,
  ...reducers,
  routing: routerReducer
}));

//combine redux and router
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>{routes}</Router>
  </Provider>,
  document.getElementById('app-root')
);
