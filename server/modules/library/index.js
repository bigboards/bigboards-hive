var LibraryService = require('./service'),
    LibraryResource = require('./resource');

module.exports.services = function(config, store) {
    return {
        library: new LibraryService(store.entity('library-item'))
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        library: new LibraryResource(services.library, responseHandler)
    };
};

module.exports.run = function(config, api, resources, services) {
    var resource = resources.library;

    api.registerGet('/api/v1/library/', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type/:owner', function(req, res) { return resource.search(req, res); });
    api.registerGet('/api/v1/library/:type/:owner/:slug', function(req, res) { return resource.get(req, res); });

    api.registerSecurePost('/api/v1/library', api.onlyIfUser(), function(req, res) { return resource.add(req, res); });
    api.registerSecurePatch('/api/v1/library/:type/:owner/:slug', api.onlyIfCollaboratorOrOwner(services.library), function(req, res) { return resource.patch(req, res); });
    api.registerSecurePost('/api/v1/library/:type/:owner/:slug', api.onlyIfCollaboratorOrOwner(services.library), function(req, res) { return resource.update(req, res); });
    api.registerSecureDelete('/api/v1/library/:type/:owner/:slug', api.onlyIfCollaboratorOrOwner(services.library), function(req, res) { return resource.remove(req, res); });
};