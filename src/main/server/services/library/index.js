var API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.library);

        API.registerGet(app, '/api/v1/library/', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/library/:type', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/library/:type/:owner', function(req, res) { return resource.search(req, res); });
        API.registerGet(app, '/api/v1/library/:type/:owner/:slug', function(req, res) { return resource.get(req, res); });

        API.registerSecurePost(app, '/api/v1/library', API.onlyIfUser, function(req, res) { return resource.add(req, res); });
        API.registerSecurePost(app, '/api/v1/library/:type/:owner/:slug', API.onlyIfOwner, function(req, res) { return resource.update(req, res); });
        API.registerSecureDelete(app, '/api/v1/library/:type/:owner/:slug', API.onlyIfOwner, function(req, res) { return resource.remove(req, res); });
    }
};