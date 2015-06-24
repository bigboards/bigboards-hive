var API = require('../../utils/api-utils');

function LibraryLinker(api, resource) {
    this.api = api;
    this.resource = resource;
}

LibraryLinker.prototype.link = function() {
    var self = this;

    this.api.registerGet('/api/v1/library/', function(req, res) { return self.resource.search(req, res); });
    this.api.registerGet('/api/v1/library/:type', function(req, res) { return self.resource.search(req, res); });
    this.api.registerGet('/api/v1/library/:type/:owner', function(req, res) { return self.resource.search(req, res); });
    this.api.registerGet('/api/v1/library/:type/:owner/:slug', function(req, res) { return self.resource.get(req, res); });

    this.api.registerSecurePost('/api/v1/library', API.onlyIfUser, function(req, res) { return self.resource.add(req, res); });
    this.api.registerSecurePost('/api/v1/library/:type/:owner/:slug', API.onlyIfOwner, function(req, res) { return self.resource.update(req, res); });
    this.api.registerSecureDelete('/api/v1/library/:type/:owner/:slug', API.onlyIfOwner, function(req, res) { return self.resource.remove(req, res); });
};

module.exports = LibraryLinker;