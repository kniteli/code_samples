import React from 'react';
import Router, { Route, IndexRoute } from 'react-router';
import AppframeComponent from './components/appframe';
import authRoute from './components/authed_route';
import withUserList from './components/with_user_list';
import {LoginController, RegistrationController, ItineraryController, PrintController} from './controllers';

const routes = (
  <Route path="/" component={AppframeComponent} >
    <IndexRoute component={authRoute(withUserList(ItineraryController))} />
    <Route path="/print" component={authRoute(PrintController)} />
    <Route path="/login" component={LoginController} />
    <Route path="/register" component={RegistrationController} />
  </Route>
);

export default routes;
