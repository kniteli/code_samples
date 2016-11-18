'use strict';

const service = require('feathers-sequelize');
const test = require('./test-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: test(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/tests', service(options));

  // Get our initialize service to that we can bind hooks
  const testService = app.service('/tests');

  // Set up our before hooks
  testService.before(hooks.before);

  // Set up our after hooks
  testService.after(hooks.after);
};
