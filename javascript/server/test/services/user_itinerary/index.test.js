'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('user_itinerary service', function() {
  it('registered the user_itineraries service', () => {
    assert.ok(app.service('user_itineraries'));
  });
});
