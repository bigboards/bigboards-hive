var SettingsService = require('./service'),
    SettingsResource = require('./resource');

module.exports.services = function(config, store)  {
    return {
        settings: new SettingsService()
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        settings: new SettingsResource(services.settings, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.settings;

    api.registerGet('/api/v1/settings', function(req, res) { return resource.get(req, res); });
};