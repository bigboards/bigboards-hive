var LinkService = require('./service'),
    LinkResource = require('./resource');

module.exports.services = function(config, store)  {
    return {
        link: new LinkService(config)
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        link: new LinkResource(services.link, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.link;

    api.registerSecureGet('/api/v1/link', api.onlyIfUser(), function(req, res) { return resource.get(req, res); });

    api.registerPut('/api/v1/link/:code', function(req, res) { return resource.connectNodeToDevice(req, res); });
};