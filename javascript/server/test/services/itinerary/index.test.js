'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('itinerary service', function() {
  it('registered the itineraries service', () => {
    assert.ok(app.service('itineraries'));
  });
});
