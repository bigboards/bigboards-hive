var LibraryService = require('./service'),
    LibraryResource = require('./resource');

module.exports.services = function(config, storages) {
    return {
        library: new LibraryService(storages.library)
    };
};

module.exports.resources = function(config, services, responseHandler) {
    return {
        library: new LibraryResource(services.library, responseHandler)
    };
};

module.exports.run = function(config, api, resources) {
    var resource = resources.library;

    api.registerGet('/api/v1/library/', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type/:owner', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type/:owner/:slug', function(req, res) { return resource.get(req, res); });

    api.registerSecurePost('/api/v1/library', api.onlyIfUser, function(req, res) { return resource.add(req, res); });
    api.registerSecurePost('/api/v1/library/:type/:owner/:slug', api.onlyIfOwner, function(req, res) { return resource.update(req, res); });
    api.registerSecureDelete('/api/v1/library/:type/:owner/:slug', api.onlyIfOwner, function(req, res) { return resource.remove(req, res); });
};