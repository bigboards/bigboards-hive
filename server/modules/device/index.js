var DeviceService = require('./service'),
    DeviceResource = require('./resource');

module.exports.services = function(config, store)  {
    return {
        device: new DeviceService(store.entity('device'))
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        device: new DeviceResource(services.device, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.device;

    api.registerSecureGet('/api/v1/devices', api.onlyIfUser(), function(req, res) { return resource.getDevices(req, res); });
    api.registerSecurePut('/api/v1/devices', api.onlyIfUser(), function(req, res) { return resource.addDevice(req, res); });
    api.registerSecureGet('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.getDevice(req, res); });
    api.registerSecurePatch('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.updateDevice(req, res); });
    api.registerSecureDelete('/api/v1/devices/:deviceId', api.onlyIfUser(), function(req, res) { return resource.removeDevice(req, res); });
};