'use strict';

//lets just use the same hooks as the itinerary endpoint, since this is
//essentially a duplicate except with user_ids where appropriate
const hooks = require('../itinerary/hooks');
const errors = require('feathers-errors');

class UserItineraryService {
  constructor(service) {
    this.service = service;
  }

  find(params) {
    Object.assign(params.query, {user_id: params.user_id});
    return this.service.find(params);
  }

  //this get is like a normal get except it will reject if the routes user_id
  //doesn't match the user_id of the requested_itinerary
  get(id, params) {
    //merge route supplied query with user supplied query
    Object.assign(params.query, {id: id, user_id: params.user_id});
    return this.service.Model.findOne({where: params.query}).then(instance => {
      if (!instance) {
        throw new errors.NotFound(`No record found for id '${id}' with user_id '${params.user_id}'`);
      }

      return instance;
    });
  }

  create(data, params) {
    data.user_id = params.user_id;
    return this.service.create(data, params);
  }

  update(id, data, params) {
    Object.assign(params.query, {id: id, user_id: params.user_id});
    return this.service.Model.findOne({where: params.query}).then(instance => {
      if (!instance) {
        throw new errors.NotFound(`No record found for id '${id}' with user_id '${params.user_id}'`);
      }

      return instance.update(data, {where: params.query});
    });
  }

  patch(id, data, params) {
    //TODO: Handle patching multiple records at once.
    Object.assign(params.query, { id: id, user_id: params.user_id });
    return this.service.Model.findOne({where: params.query}).then(instance => {
      if (!instance) {
        throw new errors.NotFound(`No record found for id '${id}' with user_id '${params.user_id}'`);
      }

      return instance.update(data, {where: params.query});
    });
  }

  remove(id, params) {
    Object.assign(params.query, {id: id, user_id: params.user_id});
    return this.service.Model.findOne({where: params.query}).then(instance => {
      if (!instance) {
        throw new errors.NotFound(`No record found for id '${id}' with user_id '${params.user_id}'`);
      }

      return instance.destroy();
    });
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/users/:user_id/itineraries', new UserItineraryService(app.service('/itineraries')));

  // Get our initialize service to that we can bind hooks
  const user_itinerary_service = app.service('/users/:user_id/itineraries');

  // Set up our before hooks
  user_itinerary_service.before(hooks.before);

  // Set up our after hooks
  user_itinerary_service.after(hooks.after);
};

module.exports.UserItineraryService = UserItineraryService;
