var Errors = require('../../errors'),
    Q = require('q');

function DeviceResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

DeviceResource.prototype.getDevices = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.get(req.user));
};

DeviceResource.prototype.getDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getDevice(req.params['deviceId']));
};

DeviceResource.prototype.addDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.addDevice(req.user, req.body));
};

DeviceResource.prototype.updateDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.updateDevice(req.params['deviceId'], req.body));
};

DeviceResource.prototype.removeDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.removeDevice(req.params['deviceId']));
};

module.exports = DeviceResource;
