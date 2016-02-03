var fs = require('fs');
var should = require('should');
var assert = require('assert');
var esSpawner = require('../../es');

describe('tint.service', function() {
    before(function() {
        esSpawner.setup();
        require('./tint.service.data');
    });

    after(function() {
        esSpawner.teardown();
    });

    describe('for an anonymous visitor', function() {
        describe('listing tints', function() {
            it('should return all public tints if no criteria is given', function() {

            });

            it('should return the public tints matching the criteria if a criteria is given', function() {

            });
        });
        describe('retrieving a tint', function() {
            it('should return the tint details if it is a public tint', function() {

            });

            it('should NOT return the tint details if it is a private tint', function() {

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

        describe('creating a tint', function() {
            it('should be possible', function() {

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

        describe('and the owner of the tint', function() {
            describe('patching a tint', function() {
                it('should be possible', function() {

                });
            });

            describe('removing a tint', function() {
                it('should be possible', function() {

                });
            });
        });

        describe('and a collaborator of the tint', function() {
            describe('patching a tint', function() {
                it('should be possible', function() {

                });
            });

            describe('removing a tint', function() {
                it('should not be possible', function() {

                });
            });
        });
    });
});