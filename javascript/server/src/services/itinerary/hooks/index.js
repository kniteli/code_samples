'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

const restrict_to_owner_unless_admin = auth.restrictToRoles({
                                          roles: ['admin'],
                                          fieldName: 'role',
                                          idField: 'id',
                                          ownerField: 'user_id',
                                          owner: true
                                        });

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    (hook) => {
      if(hook.params.user.role === 'admin') {
        return Promise.resolve(hook);
      }
      return auth.queryWithCurrentUser({idField: 'id', as: 'user_id'})(hook);
    }
  ],
  get: [restrict_to_owner_unless_admin],
  create: [
    hook => {
      if(hook.params.user.role === 'admin') {
        return Promise.resolve(hook);
      }
      return auth.associateCurrentUser({idField: 'id', as: 'user_id'})(hook);
    }
  ],
  update: [restrict_to_owner_unless_admin],
  patch: [restrict_to_owner_unless_admin],
  remove: [restrict_to_owner_unless_admin]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
