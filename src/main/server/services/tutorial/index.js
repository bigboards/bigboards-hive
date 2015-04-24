var API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.tutorial);

        API.registerGet(app, '/api/v1/tutorials', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/tutorials/:owner', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/tutorials/:owner/:slug', function(req, res) { return resource.get(req, res); });

        API.registerSecurePut(app, '/api/v1/tutorials', API.onlyIfUser, function(req, res) { return resource.add(req, res); });
        API.registerSecurePut(app, '/api/v1/tutorials/:slug', API.onlyIfOwner, function(req, res) { return resource.update(req, res); });
        API.registerSecureDelete(app, '/api/v1/tutorials/:slug', API.onlyIfOwner, function(req, res) { return resource.remove(req, res); });
    }
};