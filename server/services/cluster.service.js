var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    shortId = require("shortid");

module.exports = {
    filter: filter,
    add: addCluster,
    get: getCluster,
    patch: patchCluster,
    remove: removeCluster
};

function filter(requester, criteria, paging) {
    var filter = filterBuilder.build(requester, criteria, false, true, true);
    return es.lookup.raw('cluster', filter, ['profile', 'type', 'name', 'description'], paging);
}

function getCluster(requester, clusterId) {
    su.param.exists('clusterId', clusterId);

    return es.access('cluster', clusterId, requester, 'get').then(function() {
        return es.lookup.id('cluster', clusterId);
    });
}

function addCluster(requester, data) {
    // -- generate a new shortId
    var id = shortId.generate();

    return es.access('cluster', id, requester, 'add').then(function() {
        return es.create('cluster', id, data);
    });
}

function patchCluster(requester, clusterId, patches) {
    su.param.exists('clusterId', clusterId);

    return es.access('cluster', clusterId, requester, 'patch').then(function() {
        return es.patch.id('cluster', clusterId, patches);
    });
}

function removeCluster(requester, clusterId) {
    su.param.exists('clusterId', clusterId);

    return es.access('cluster', clusterId, requester, 'remove').then(function() {
        return es.remove.id('cluster', clusterId);
    });
}