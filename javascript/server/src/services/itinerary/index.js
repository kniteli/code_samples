'use strict';

const service = require('feathers-sequelize');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: app.get('models').itinerary,
    paginate: {
      default: 25,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/itineraries', service(options));

  // Get our initialize service to that we can bind hooks
  const itineraryService = app.service('/itineraries');

  // Set up our before hooks
  itineraryService.before(hooks.before);

  // Set up our after hooks
  itineraryService.after(hooks.after);
};
