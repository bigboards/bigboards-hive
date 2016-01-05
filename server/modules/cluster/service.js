var Errors = require('../../errors'),
    Q = require('q'),
    moment = require('moment'),
    log = require('winston'),
    esUtils = require('../../utils/es-utils');
var AWS = require('aws-sdk');

function ClusterService(storage, deviceStorage, config) {
    this.storage = storage;
    this.deviceStorage = deviceStorage;
}

ClusterService.prototype.getClusters = function(user, fields, paging) {
    if (user) {
        var collabFilters = [
            { "term": {"owner": user.hive_id }},
            { "nested": { "path": "collaborators", "query": { "match": { "collaborators.id": user.hive_id }}}}
        ];
    }

    var body = {
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"bool": {"should": collabFilters }}
            }
        }
    };

    if (fields) {
        body._source = fields;
    }

    return this.storage.search(body, fields, paging);
};

ClusterService.prototype.getCluster = function(clusterId) {
    return this.storage.get(clusterId, null, function(doc) {
        var data = esUtils.documentFields(doc);

        return Q({
            id: doc._id,
            data: data,
            type: doc._type
        });
    });
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
    return this.storage.removeDirect(clusterId);
};

ClusterService.prototype.connectClusterDevice = function(clusterId, deviceId) {
    var me = this;

    return this.deviceStorage.get(deviceId).then(function(device) {
        if (device.cluster)
            return {
                error: 'AlreadyLinked',
                link: {
                    source: deviceId,
                    target: clusterId
                }
            };

        var patches = [
            {op: 'set', fld: 'cluster', val: clusterId }
        ];

        return me.deviceStorage.patch(deviceId, patches).then(function() {
            return me.deviceStorage.get(deviceId);
        });
    });
};

ClusterService.prototype.disconnectClusterDevice = function(clusterId, deviceId) {
    var patches = [
        {op: 'purge', fld: 'cluster' }
    ];

    return this.deviceStorage.patch(deviceId, patches);
};

module.exports = ClusterService;