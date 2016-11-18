'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

const restrict_to_owner_unless_admin_manager = auth.restrictToRoles({
                                                roles: ['admin', 'manager'],
                                                fieldName: 'role',
                                                idField: 'id',
                                                ownerField: 'id',
                                                owner: true
                                              });

const restrict_unless_admin_manager = auth.restrictToRoles({
                                                roles: ['admin', 'manager'],
                                                fieldName: 'role',
                                                idField: 'id',
                                                ownerField: 'id',
                                                owner: false
                                              });
const restrict_update_fields = hook => {
  if(hook.params.user && (hook.params.user.role === 'manager' || hook.params.user.role === 'admin')) {
    return Promise.resolve(hook)
  }
  return hooks.remove('role')(hook);
};
exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrict_unless_admin_manager
  ],
  get: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrict_to_owner_unless_admin_manager
  ],
  create: [
    auth.populateUser(),
    auth.hashPassword(),
    restrict_update_fields
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.hashPassword(),
    restrict_to_owner_unless_admin_manager,
    restrict_update_fields
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.hashPassword(),
    restrict_to_owner_unless_admin_manager,
    restrict_update_fields
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrict_to_owner_unless_admin_manager
  ]
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
