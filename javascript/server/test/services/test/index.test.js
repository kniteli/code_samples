'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('test service', function() {
  it('registered the tests service', () => {
    assert.ok(app.service('tests'));
  });
});
