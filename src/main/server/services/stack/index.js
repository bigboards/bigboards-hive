var API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.stack);

        API.registerGet(app, '/api/v1/stacks', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/stacks/:owner', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/stacks/:owner/:slug', function(req, res) { return resource.get(req, res); });

        API.registerSecurePut(app, '/api/v1/stacks', API.onlyIfUser, function(req, res) { return resource.add(req, res); });
        API.registerSecurePut(app, '/api/v1/stacks/:slug', API.onlyIfOwner, function(req, res) { return resource.update(req, res); });
        API.registerSecureDelete(app, '/api/v1/stacks/:slug', API.onlyIfOwner, function(req, res) { return resource.remove(req, res); });
    }
};