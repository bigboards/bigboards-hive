var API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.profile);

        API.registerGet(app, '/api/v1/p', function(req, res) { return resource.search(req, res); });
        API.registerPut(app, '/api/v1/p/', function(req, res) { return resource.add(req, res); });

        API.registerGet(app, '/api/v1/p/:id', function(req, res) { return resource.get(req, res); });
        API.registerPut(app, '/api/v1/p/:id', function(req, res) { return resource.update(req, res); });
        API.registerDelete(app, '/api/v1/p/:id', function(req, res) { return resource.remove(req, res); });
    }
};