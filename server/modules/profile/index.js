var ProfileService = require('./service'),
    ProfileResource = require('./resource');

module.exports.services = function(config, store) {
    return {
        profile: new ProfileService(store.entity('profile'))
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        profile: new ProfileResource(services.profile, responseHandler)
    };
};

module.exports.run = function(config, api, resources) {
    var resource = resources.profile;

    api.registerGet('/api/v1/people', function(req, res) { return resource.search(req, res); });
    api.registerPut('/api/v1/people/', function(req, res) { return resource.add(req, res); });

    api.registerGet('/api/v1/people/:id', function(req, res) { return resource.get(req, res); });
    api.registerSecurePut('/api/v1/people/:id', api.onlyIfMe, function(req, res) { return resource.update(req, res); });
    api.registerSecureDelete('/api/v1/people/:id', api.onlyIfMe, function(req, res) { return resource.remove(req, res); });
};