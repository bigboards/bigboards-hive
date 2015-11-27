var Errors = require('../../errors'),
    Q = require('q'),
    moment = require('moment'),
    log = require('winston');
var AWS = require('aws-sdk');

function ClusterService(storage, deviceStorage, config) {
    this.storage = storage;
    this.deviceStorage = deviceStorage;
}

ClusterService.prototype.getClusters = function(user, fields, paging) {
    var body = {
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"term": {"owner": user.hive_id }}
            }
        }
    };

    if (fields) {
        body._source = fields;
    }

    return this.storage.search(body, fields, paging);
};

ClusterService.prototype.getCluster = function(clusterId) {
    return this.storage.get(clusterId);
};

ClusterService.prototype.getClusterDevices = function(clusterId, paging) {
    var body = {
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"term": {"cluster": clusterId }}
            }
        }
    };

    return this.deviceStorage.search(body, null, paging);
};

ClusterService.prototype.addCluster = function(user, data) {
    var req = {
        name: data.name,
        owner: user.hive_id,
        type: data.type
    };

    if (data.description) req.description = data.description;

    return this.storage.add(req);
};

ClusterService.prototype.updateCluster = function(clusterId, patches) {
    return this.storage.patch(clusterId, patches);
};

ClusterService.prototype.removeCluster = function(clusterId) {
    return this.storage.remove(clusterId);
};

ClusterService.prototype.connectClusterDevice = function(clusterId, deviceId) {
    var patches = [
        {op: 'set', fld: 'cluster', value: clusterId }
    ];

    return this.deviceStorage.patch(deviceId, patches);
};

ClusterService.prototype.disconnectClusterDevice = function(clusterId, deviceId) {
    var patches = [
        {op: 'purge', fld: 'cluster' }
    ];

    return this.deviceStorage.patch(deviceId, patches);
};

module.exports = ClusterService;