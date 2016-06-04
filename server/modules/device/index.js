var DeviceService = require('./service'),
    DeviceResource = require('./resource');

module.exports.services = function(config, store, services, AWS)  {
    return {
        device: new DeviceService(store.entity('device'), services, config, AWS)
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        device: new DeviceResource(services.device, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.device;

    api.registerPut('/api/v1/devices', function(req, res) { return resource.registerDevice(req, res); });
    api.registerSecurePut('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.linkDevice(req, res); });

    // -- TODO: the following line is considered to be a security loophole! We will need to fix this once we have the new version online
    api.registerPatch('/api/v1/devices/:deviceId', function(req, res) { return resource.updateDevice(req, res); });

    api.registerSecureGet('/api/v1/devices', api.onlyIfUser(), function(req, res) { return resource.listDevices(req, res); });
    api.registerSecureGet('/api/v1/devices/filter', api.onlyIfUser(), function(req, res) { return resource.filterDevices(req, res); });
    api.registerSecureGet('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.getDevice(req, res); });
    api.registerSecureDelete('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.removeDevice(req, res); });
};