var Errors = require('../../errors'),
    Q = require('q');

function SettingsResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

SettingsResource.prototype.get = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.get());
};

module.exports = SettingsResource;
