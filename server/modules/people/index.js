var PeopleService = require('./service'),
    PeopleResource = require('./resource');

module.exports.services = function(config, store) {
    return {
        people: new PeopleService(store.entity('people'))
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        people: new PeopleResource(services.people, responseHandler)
    };
};

module.exports.run = function(config, api, resources) {
    var resource = resources.people;

    api.registerGet('/api/v1/people', function(req, res) { return resource.search(req, res); });
    api.registerPut('/api/v1/people/', function(req, res) { return resource.add(req, res); });

    api.registerGet('/api/v1/people/:id', function(req, res) { return resource.get(req, res); });
    api.registerSecurePut('/api/v1/people/:id', api.onlyIfMe, function(req, res) { return resource.update(req, res); });
    api.registerSecureDelete('/api/v1/people/:id', api.onlyIfMe, function(req, res) { return resource.remove(req, res); });
};