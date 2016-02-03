var eu = require('../utils/entity-utils'),
    es = require('../es'),
    au = require('../utils/api-utils');

module.exports = {
    access: checkAccess,
    nodes: getClusterNodes,
    filter: filter,
    create: addCluster,
    get: getCluster,
    patch: patchCluster,
    remove: removeCluster
};

function checkAccess(profile, id, requester, operation) {
    return es.access('cluster', eu.id(profile, id), requester, operation);
}

function filter(profile, criteria, paging) {
    var filterList = [];

    criteria.forEach(function(filter) {
        var fb = {term: {}};
        fb.term[filter.field] = filter.value;
        filterList.push(fb);
    });

    filterList.push({term: {profile: profile.id}});

    var req = {
        "query": { "filtered": { } }
    };

    if (filterList.length == 1) {
        req.query.filtered.filter = filterList[0];
    } else {
        req.query.filtered.filter = {
            bool: { must: filterList }
        };
    }

    return es.lookup.raw('cluster', req, ['profile', 'type', 'name', 'description'], paging);
}

function getClusterNodes(profile, id) {
    var filterList = [];

    filterList.push({term: {cluster: eu.id(profile, id)}});

    var req = {
        "query": { "filtered": { } }
    };

    if (filterList.length == 1) {
        req.query.filtered.filter = filterList[0];
    } else {
        req.query.filtered.filter = {
            bool: { must: filterList }
        };
    }

    return es.lookup.raw('node', req, null, paging);
}

function getCluster(profile, id) {
    return es.lookup.id('cluster', eu.id(profile, id));
}

function addCluster(profile, id, data) {
    return es.create('cluster', eu.id(profile, id), data);
}

function patchCluster(profile, id, patches) {
    return es.patch.id('cluster', eu.id(profile, id), patches);
}

function removeCluster(profile, id) {
    return es.remove.id('cluster', eu.id(profile, id));
}