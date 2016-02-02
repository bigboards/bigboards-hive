var Errors = require('../../errors'),
    au = require('../../utils/api-utils'),
    Q = require('q'),
    log = require('winston');

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

DeviceResource.prototype.addDevice = function(req, res) {
    log.log('info', JSON.stringify(req.body, null, 2));

    return this.responseHandler.handle(req, res, this.service.addDevice(req.user, req.body));
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
