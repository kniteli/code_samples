'use strict';
const test = require('./test');
const userItinerary = require('./user_itinerary');
const itinerary = require('./itinerary');
const authentication = require('./authentication');
const user = require('./user');
const user_model = require('./user/user-model');
const itinerary_model = require('./itinerary/itinerary-model');
const Sequelize = require('sequelize');

module.exports = function() {
  const app = this;

  const sequelize = new Sequelize(app.get('mysql'), {
    dialect: 'mysql',
    logging: false
  });
  app.set('sequelize', sequelize);

  let models = {
    user: user_model(sequelize),
    itinerary: itinerary_model(sequelize)
  };
  setup_relationships_and_sync(models.user, models.itinerary);

  //register models for service api configuration
  app.set('models', models);

  //service api configuration
  app.configure(authentication);
  app.configure(user);
  app.configure(itinerary);
  app.configure(userItinerary);
  app.configure(test);
};

function setup_relationships_and_sync(user, itinerary) {
  itinerary.belongsTo(user, {as: 'user', foreignKey: { allowNull: false }, onDelete: 'CASCADE'});
  user.hasMany(itinerary, {as: 'itinerary'});
  user.sync();
  itinerary.sync();
}
