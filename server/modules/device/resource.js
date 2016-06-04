var Errors = require('../../errors'),
    au = require('../../utils/api-utils'),
    Q = require('q');

function DeviceResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

DeviceResource.prototype.listDevices = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.listDevices(req.user, req.query, au.parsePaging(req)));
};

DeviceResource.prototype.filterDevices = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.filterDevices(req.user, req.query, au.parsePaging(req)));
};

DeviceResource.prototype.getDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getDevice(req.params['deviceId']));
};

DeviceResource.prototype.registerDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.registerDevice(req.body));
};

DeviceResource.prototype.linkDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.linkDevice(req.user, req.params['deviceId']));
};

DeviceResource.prototype.updateDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.updateDevice(req.params['deviceId'], req.body));
};

DeviceResource.prototype.removeDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.removeDevice(req.params['deviceId']));
};


// -- DNS -------------------------------------------------------------------------------------------------------------

DeviceResource.prototype.setNodeDNS = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.setNodeDNS(req.params['deviceId'], req.params['nodeId'], req.body));
};

module.exports = DeviceResource;
