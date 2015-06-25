var ProfileService = require('./service'),
    ProfileResource = require('./resource');

var API = require('../../utils/api-utils');

module.exports.wire = function(context) {
    // -- register the profile-service
    context.registerFactory('service', 'profile-service', function (ctx) {
        return new ProfileService(ctx.get('profile-storage'));
    });

    // -- register the profile-resource
    context.registerFactory('resource', 'profile-resource', function(ctx) {
        return new ProfileResource(ctx.get('profile-service'), ctx.get('response-handler'));
    });
};

module.exports.run = function(context) {
    var resource = context.get('profile-resource');
    var api = context.get('api');

    api.registerGet('/api/v1/people', function(req, res) { return resource.search(req, res); });
    api.registerPut('/api/v1/people/', function(req, res) { return resource.add(req, res); });

    api.registerGet('/api/v1/people/:id', function(req, res) { return resource.get(req, res); });
    api.registerSecurePut('/api/v1/people/:id', API.onlyIfMe, function(req, res) { return resource.update(req, res); });
    api.registerSecureDelete('/api/v1/people/:id', API.onlyIfMe, function(req, res) { return resource.remove(req, res); });
};