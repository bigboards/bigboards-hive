var LibraryService = require('./service'),
    LibraryResource = require('./resource');

var API = require('../../utils/api-utils');

module.exports.wire = function(context) {
    // -- register the library-service
    context.registerFactory('service', 'library-service', function (ctx) {
        return new LibraryService(ctx.get('library-storage'), ctx.get('config'));
    });

    // -- register the library-resource
    context.registerFactory('resource', 'library-resource', function(ctx) {
        return new LibraryResource(ctx.get('library-service'), ctx.get('response-handler'));
    });
};

module.exports.run = function(context) {
    var resource = context.get('library-resource');
    var api = context.get('api');

    api.registerGet('/api/v1/library/', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type/:owner', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type/:owner/:slug', function(req, res) { return resource.get(req, res); });

    api.registerSecurePost('/api/v1/library', API.onlyIfUser, function(req, res) { return resource.add(req, res); });
    api.registerSecurePost('/api/v1/library/:type/:owner/:slug', API.onlyIfOwner, function(req, res) { return resource.update(req, res); });
    api.registerSecureDelete('/api/v1/library/:type/:owner/:slug', API.onlyIfOwner, function(req, res) { return resource.remove(req, res); });
};