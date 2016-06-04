var ClusterService = require('./service'),
    ClusterResource = require('./resource');

module.exports.services = function(config, store, services, AWS)  {
    return {
        cluster: new ClusterService(
            store.entity('cluster'),
            store.entity('device'),
            store.entity('cluster_incubate'),
            config
        )
    };
};

module.exports.resources = function(config, store, services, responseHandler) {
    return {
        cluster: new ClusterResource(services.cluster, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.cluster;

    api.registerPut('/api/v1/cluster/incubate', function(req, res) { return resource.incubateCluster(req, res); });

    api.registerSecureGet('/api/v1/cluster', api.onlyIfUser(), function(req, res) { return resource.getClusters(req, res); });
    api.registerSecurePut('/api/v1/cluster', api.onlyIfUser(), function(req, res) { return resource.pairCluster(req, res); });

    api.registerSecureGet('/api/v1/cluster/:clusterId', api.onlyIfUser(), function(req, res) { return resource.getCluster(req, res); });
    api.registerSecurePatch('/api/v1/cluster/:clusterId', api.onlyIfUser(), function(req, res) { return resource.updateCluster(req, res); });
    api.registerSecureDelete('/api/v1/cluster/:clusterId', api.onlyIfUser(), function(req, res) { return resource.removeCluster(req, res); });

    api.registerSecureGet('/api/v1/cluster/:clusterId/device', api.onlyIfUser(), function(req, res) { return resource.getClusterDevices(req, res); });
    api.registerSecurePut('/api/v1/cluster/:clusterId/dns', api.onlyIfUser(), function(req, res) { return resource.updateClusterDNS(req, res); });
};