var ClusterService = require('./service'),
    ClusterResource = require('./resource');

module.exports.services = function(config, store, services, AWS)  {
    return {
        cluster: new ClusterService(store.entity('cluster'), store.entity('device'), config, AWS)
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        cluster: new ClusterResource(services.cluster, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.cluster;

    api.registerGet('/api/v1/cluster/count', function(req, res) { return resource.clusterExists(req, res); });
    api.registerSecureGet('/api/v1/cluster', api.onlyIfUser(), function(req, res) { return resource.getClusters(req, res); });
    api.registerSecurePut('/api/v1/cluster', api.onlyIfUser(), function(req, res) { return resource.addCluster(req, res); });
    api.registerSecureGet('/api/v1/cluster/:clusterId', api.onlyIfUser(), function(req, res) { return resource.getCluster(req, res); });
    api.registerSecurePatch('/api/v1/cluster/:clusterId', api.onlyIfUser(), function(req, res) { return resource.updateCluster(req, res); });
    api.registerSecureDelete('/api/v1/cluster/:clusterId', api.onlyIfUser(), function(req, res) { return resource.removeCluster(req, res); });

    api.registerSecureGet('/api/v1/cluster/:clusterId/device', api.onlyIfUser(), function(req, res) { return resource.getClusterDevices(req, res); });
    api.registerSecurePut('/api/v1/cluster/:clusterId/device/:deviceId', api.onlyIfUser(), function(req, res) { return resource.connectClusterDevice(req, res); });
    api.registerSecureDelete('/api/v1/cluster/:clusterId/device/:deviceId', api.onlyIfUser(), function(req, res) { return resource.disconnectClusterDevice(req, res); });
};