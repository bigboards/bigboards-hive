var fs = require('fs');
var should = require('should');
var assert = require('assert');
var esSpawner = require('../../es');
var Q = require('q');

var log4js = require('log4js');
var logger = log4js.getLogger();

var auth = require('../../../auth/auth-strategy');

describe('auth', function() {
    describe('when not authenticated', function() {
        it('should be possible to get a public entity', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'public' };

            return auth.check(entity, null, 'test_entity', 'get');
        });

        it('should not be possible to get a private entity', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private' };

            return auth.check(entity, null, 'test_entity', 'get').then(function() {
                throw new Error('should not be possible to get a private entity');
            }, function(error) {
                logger.debug(error.message);
                return true;
            });
        });

        it('should not be possible to add a new entity', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'public' };

            return auth.check(entity, null, 'test_entity', 'add').then(function() {
                throw new Error('should not be possible to add a new entity');
            }, function(error) {
                logger.debug(error.message);
                return true;
            });
        });

        it('should not be possible to patch an entity', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'public' };

            return auth.check(entity, null, 'test_entity', 'patch').then(function() {
                throw new Error('should not be possible to patch an entity');
            }, function(error) {
                logger.debug(error.message);
                return true;
            });
        });

        it('should not be possible to remove an entity', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'public' };

            return auth.check(entity, null, 'test_entity', 'remove').then(function() {
                throw new Error('should not be possible to remove an entity');
            }, function(error) {
                logger.debug(error.message);
                return true;
            });
        });
    });

    describe('when authenticated', function() {
        it('should be possible to get a public entity', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'public' };

            return auth.check(entity, null, 'test_entity', 'get');
        });

        it('should be possible to get a private entity if I am the owner', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private', profile: 'requester-id'};

            return auth.check(entity, 'requester-id', 'test_entity', 'get');
        });

        it('should NOT be possible to get a private entity if I am NOT the owner', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private', profile: 'not-requester-id' };

            return auth.check(entity, 'requester-id', 'test_entity', 'get').then(function() {
                throw new Error('should NOT be possible to get a private entity if I am NOT the owner');
            }, function(error) {
                logger.debug(error.message);
                return true;
            });
        });

        describe('and a collaborator with all permissions', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private', profile: 'not-requester-id', collaborators: [{ profile: 'requester-id', permissions: ['*']}]};

            it('should be possible to get the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'get');
            });

            it('should be possible to patch the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'patch');
            });

            it('should be possible to remove the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'remove');
            });
        });

        describe('and a collaborator with "get" permissions', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private', profile: 'not-requester-id', collaborators: [{ profile: 'requester-id', permissions: ['get']}]};

            it('should be possible to get the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'get');
            });

            it('should NOT be possible to patch the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'patch').then(function() {
                    throw new Error('should NOT be possible to patch the private entity');
                }, function(error) {
                    logger.debug(error.message);
                    return true;
                });
            });

            it('should NOT be possible to remove the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'remove').then(function() {
                    throw new Error('should NOT be possible to remove the private entity');
                }, function(error) {
                    logger.debug(error.message);
                    return true;
                });
            });
        });

        describe('and a collaborator with "patch" permissions', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private', profile: 'not-requester-id', collaborators: [{ profile: 'requester-id', permissions: ['patch']}]};

            it('should NOT be possible to get the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'get').then(function() {
                    throw new Error('should NOT be possible to get the private entity');
                }, function(error) {
                    logger.debug(error.message);
                    return true;
                });
            });

            it('should be possible to patch the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'patch');
            });

            it('should NOT be possible to remove the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'remove').then(function() {
                    throw new Error('should NOT be possible to remove the private entity');
                }, function(error) {
                    logger.debug(error.message);
                    return true;
                });
            });
        });

        describe('and a collaborator with "remove" permissions', function() {
            var entity = { id: 'entity-id', name: 'entity-name', scope: 'private', profile: 'not-requester-id', collaborators: [{ profile: 'requester-id', permissions: ['remove']}]};

            it('should NOT be possible to get the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'get').then(function() {
                    throw new Error('should NOT be possible to get the private entity');
                }, function(error) {
                    logger.debug(error.message);
                    return true;
                });
            });

            it('should NOT be possible to patch the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'patch').then(function() {
                    throw new Error('should NOT be possible to patch the private entity');
                }, function(error) {
                    logger.debug(error.message);
                    return true;
                });
            });

            it('should be possible to remove the private entity', function() {
                return auth.check(entity, 'requester-id', 'test_entity', 'remove');
            });
        });

    });
});