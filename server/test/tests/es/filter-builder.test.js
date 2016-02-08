var fs = require('fs');
var should = require('should');
var assert = require('assert');
var Q = require('q');

var log4js = require('log4js');
var logger = log4js.getLogger();

var builder = require('../../../es/filter-builder');

describe('es', function() {
    describe('when not authenticated', function() {
        describe('an entity with a scope', function() {
            it('should result in a filter for all public entities', function() {
                var filter = builder.build(null, null, true, false, false);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('term');
                filter.query.filtered.filter.term.should.have.a.property('scope', 'public');
            });
        });

        describe('an entity with a profile', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build(null, null, false, true, false);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('match_all', {});
            });
        });

        describe('an entity with a collaborator', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build(null, null, false, false, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('match_all', {});
            });
        });

        describe('an entity with a scope and a profile', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build(null, null, true, true, false);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('term');
                filter.query.filtered.filter.term.should.have.a.property('scope', 'public');
            });
        });

        describe('an entity with a scope and a collaborator', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build(null, null, true, false, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('term');
                filter.query.filtered.filter.term.should.have.a.property('scope', 'public');
            });
        });

        describe('an entity with a profile and a collaborator', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build(null, null, false, true, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('match_all', {});
            });
        });

        describe('an entity with a scope, a profile and a collaborator', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build(null, null, true, false, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('term');
                filter.query.filtered.filter.term.should.have.a.property('scope', 'public');
            });
        });
    });

    describe('when authenticated', function() {
        describe('an entity with a scope', function() {
            it('should result in a filter for all public entities', function() {
                var filter = builder.build({ id: 'requester-id' }, null, true, false, false);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('term');
                filter.query.filtered.filter.term.should.have.a.property('scope', 'public');
            });
        });

        describe('an entity with a profile', function() {
            it('should result in a filter for all entities', function() {
                var filter = builder.build({ id: 'requester-id' }, null, false, true, false);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('term');
                filter.query.filtered.filter.term.should.have.a.property('profile', 'requester-id');
            });
        });

        describe('an entity with a collaborator', function() {
            it('should result in a filter for all entities for which the requester is a collaborator with filter permissions', function() {
                var filter = builder.build({ id: 'requester-id' }, null, false, false, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('nested');
                filter.query.filtered.filter.nested.should.have.a.property('path', 'collaborators');
                filter.query.filtered.filter.nested.should.have.a.property('query');
                filter.query.filtered.filter.nested.query.should.have.a.property('bool');
                filter.query.filtered.filter.nested.query.bool.should.have.a.property('must').and.be.instanceOf(Array).and.have.lengthOf(2);

                filter.query.filtered.filter.nested.query.bool.must[0].should.have.a.property('term');
                filter.query.filtered.filter.nested.query.bool.must[0].term.should.have.a.property('collaborators.profile', 'requester-id');

                filter.query.filtered.filter.nested.query.bool.must[1].should.have.a.property('bool');
                filter.query.filtered.filter.nested.query.bool.must[1].bool.should[0].should.have.a.property('term');
                filter.query.filtered.filter.nested.query.bool.must[1].bool.should[0].term.should.have.a.property('collaborators.permissions', '*');
                filter.query.filtered.filter.nested.query.bool.must[1].bool.should[1].should.have.a.property('term');
                filter.query.filtered.filter.nested.query.bool.must[1].bool.should[1].term.should.have.a.property('collaborators.permissions', 'filter');
            });
        });

        describe('an entity with a scope and a profile', function() {
            it('should result in a filter for all public entities as well as the private entities for which the requester is the owner', function() {
                var filter = builder.build({ id: 'requester-id' }, null, true, true, false);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('bool');

                filter.query.filtered.filter.bool.should[0].should.have.a.property('term');
                filter.query.filtered.filter.bool.should[0].term.should.have.a.property('scope', 'public');

                filter.query.filtered.filter.bool.should[1].should.have.a.property('term');
                filter.query.filtered.filter.bool.should[1].term.should.have.a.property('profile', 'requester-id');
            });
        });

        describe('an entity with a scope and a collaborator', function() {
            it('should result in a filter for all public entities as well as the private entities for which the requester is a collaborator with filter rights', function() {
                var filter = builder.build({ id: 'requester-id' }, null, true, false, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('bool');

                filter.query.filtered.filter.bool.should[0].should.have.a.property('term');
                filter.query.filtered.filter.bool.should[0].term.should.have.a.property('scope', 'public');

                var collaboratorFilter = filter.query.filtered.filter.bool.should[1];
                collaboratorFilter.should.have.a.property('nested');
                collaboratorFilter.nested.should.have.a.property('path', 'collaborators');
                collaboratorFilter.nested.should.have.a.property('query');
                collaboratorFilter.nested.query.should.have.a.property('bool');
                collaboratorFilter.nested.query.bool.should.have.a.property('must').and.be.instanceOf(Array).and.have.lengthOf(2);

                collaboratorFilter.nested.query.bool.must[0].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[0].term.should.have.a.property('collaborators.profile', 'requester-id');

                collaboratorFilter.nested.query.bool.must[1].should.have.a.property('bool');
                collaboratorFilter.nested.query.bool.must[1].bool.should[0].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[1].bool.should[0].term.should.have.a.property('collaborators.permissions', '*');
                collaboratorFilter.nested.query.bool.must[1].bool.should[1].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[1].bool.should[1].term.should.have.a.property('collaborators.permissions', 'filter');
            });
        });

        describe('an entity with a profile and a collaborator', function() {
            it('should result in a filter for all entities for which the requester is the owner or a collaborator with filter rights', function() {
                var filter = builder.build({ id: 'requester-id' }, null, false, true, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('bool');

                filter.query.filtered.filter.bool.should[0].should.have.a.property('term');
                filter.query.filtered.filter.bool.should[0].term.should.have.a.property('profile', 'requester-id');

                var collaboratorFilter = filter.query.filtered.filter.bool.should[1];
                collaboratorFilter.should.have.a.property('nested');
                collaboratorFilter.nested.should.have.a.property('path', 'collaborators');
                collaboratorFilter.nested.should.have.a.property('query');
                collaboratorFilter.nested.query.should.have.a.property('bool');
                collaboratorFilter.nested.query.bool.should.have.a.property('must').and.be.instanceOf(Array).and.have.lengthOf(2);

                collaboratorFilter.nested.query.bool.must[0].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[0].term.should.have.a.property('collaborators.profile', 'requester-id');

                collaboratorFilter.nested.query.bool.must[1].should.have.a.property('bool');
                collaboratorFilter.nested.query.bool.must[1].bool.should[0].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[1].bool.should[0].term.should.have.a.property('collaborators.permissions', '*');
                collaboratorFilter.nested.query.bool.must[1].bool.should[1].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[1].bool.should[1].term.should.have.a.property('collaborators.permissions', 'filter');
            });
        });

        describe('an entity with a scope, a profile and a collaborator', function() {
            it('should be possible to get a public entity', function() {
                var filter = builder.build({ id: 'requester-id' }, null, true, true, true);

                filter.should.have.a.property('query');
                filter.query.should.have.a.property('filtered');
                filter.query.filtered.should.have.a.property('filter');

                filter.query.filtered.filter.should.have.a.property('bool');

                var scopeFilter = filter.query.filtered.filter.bool.should[0];
                scopeFilter.should.have.a.property('term');
                scopeFilter.term.should.have.a.property('scope', 'public');

                var profileFilter = filter.query.filtered.filter.bool.should[1];
                profileFilter.should.have.a.property('term');
                profileFilter.term.should.have.a.property('profile', 'requester-id');

                var collaboratorFilter = filter.query.filtered.filter.bool.should[2];
                collaboratorFilter.should.have.a.property('nested');
                collaboratorFilter.nested.should.have.a.property('path', 'collaborators');
                collaboratorFilter.nested.should.have.a.property('query');
                collaboratorFilter.nested.query.should.have.a.property('bool');
                collaboratorFilter.nested.query.bool.should.have.a.property('must').and.be.instanceOf(Array).and.have.lengthOf(2);

                collaboratorFilter.nested.query.bool.must[0].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[0].term.should.have.a.property('collaborators.profile', 'requester-id');

                collaboratorFilter.nested.query.bool.must[1].should.have.a.property('bool');
                collaboratorFilter.nested.query.bool.must[1].bool.should[0].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[1].bool.should[0].term.should.have.a.property('collaborators.permissions', '*');
                collaboratorFilter.nested.query.bool.must[1].bool.should[1].should.have.a.property('term');
                collaboratorFilter.nested.query.bool.must[1].bool.should[1].term.should.have.a.property('collaborators.permissions', 'filter');
            });
        });
    });

});