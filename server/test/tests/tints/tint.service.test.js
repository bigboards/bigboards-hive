var fs = require('fs');
var should = require('should');
var assert = require('assert');
var esSpawner = require('../../es');
var Q = require('q');

var e = require('../../entity');

var TintService = require('../../../services/tint.service');

after(function() {
    //esSpawner.teardown();
});

//beforeEach(function() {
//    this.timeout(60000);
//    // -- remove the tints that have been added
//    return esSpawner.clear('tint');
//});

xdescribe('tint.service', function() {
    this.timeout(10000);

    describe('for an anonymous visitor', function() {
        before(function() {
            return esSpawner.clear('tint').then(function() {
                return Q.all([
                    e.tint('daan', 'tint-1').scope('public').collaborator('wim', ['*']).store(),
                    e.tint('daan', 'tint-2').scope('private').store(),
                    e.tint('wim', 'tint-3').scope('public').store()
                ]);
            });
        });

        describe('listing tints', function() {
            it('should return all public tints if no criteria is given', function() {
                return TintService.filter(null, [], null)
                    .then(function(results) {
                        results.hits.should.be.instanceOf(Array).and.have.lengthOf(2);
                    });
            });

            it('should return the public tints matching the criteria if a criteria is given', function() {
                return TintService.filter(null, [{field: 'profile', value: 'wim'}], null)
                    .then(function(results) {
                        results.hits.should.be.instanceOf(Array).and.have.lengthOf(1);
                    });
            });
        });
        describe('retrieving a tint', function() {
            it('should return the tint details if it is a public tint', function() {
                return TintService.get('daan', 'tint-1').then(function(tint) {
                    tint.should.have.a.property('data');
                    tint.data.should.have.a.property('collaborators');
                    tint.data.collaborators.should.be.instanceOf(Array);
                });
            });

            it('should NOT return the tint details if it is a private tint', function() {
                return TintService.get('daan', 'tint-2').then(function(tint) {
                    throw new Error('This should not be possible');
                }, function(error) {
                    return true;
                });
            });
        });
        describe('creating a tint', function() {
            it('should not be possible', function() {

            });
        });
        describe('patching a tint', function() {
            it('should not be possible', function() {

            });
        });
        describe('removing a tint', function() {
            it('should not be possible', function() {

            });
        });
    });

    describe('for an authenticated user', function() {
        describe('listing tints', function() {
            it('should return all public tints and private tints linked to the user if no criteria is given', function() {

            });

            it('should return the public tints and private tints linked to the user matching the criteria if a criteria is given', function() {

            });
        });
        describe('retrieving a tint', function() {
            it('should return the tint details if it is a public tint', function() {

            });

            it('should return the tint details if it is a private tint linked to the user', function() {

            });

            it('should NOT return the tint details if it is a private tint not linked to the user', function() {

            });
        });
    });
});