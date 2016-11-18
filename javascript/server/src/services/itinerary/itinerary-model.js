'use strict';

// itinerary-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');
const user = require('../user/user-model');

module.exports = function(sequelize) {
  const itinerary = sequelize.define('itineraries', {
    destination: {
      type: Sequelize.STRING,
      allowNull: false
    },
    start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT
    }
  }, {
    freezeTableName: true,
    underscored: true,
    indexes: [
      {
        name: "date_idx",
        fields: ['start_date', 'end_date']
      }
    ]
  });

  return itinerary;
};
