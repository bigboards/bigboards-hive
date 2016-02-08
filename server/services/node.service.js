var eu = require('../utils/entity-utils'),
    es = require('../es'),
    filterBuilder = require('../es/filter-builder');

module.exports = {
    list: {
        byFilter: listByFilter,
        byCluster: listByCluster
    },
    add: add,
    get: get,
    patch: patch,
    remove: remove
};

function listByFilter(requester, criteria, paging) {
    var filter = filterBuilder.build(requester, criteria, false, true, true);
    return es.lookup.raw('cluster', filter, null, paging);
}

function listByCluster(requester, clusterProfile, clusterSlug, paging) {
    return listByFilter(requester, [{field: 'cluster', value: eu.id(clusterProfile, clusterSlug)}], paging);
}

function get(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('cluster', id, requester, 'get').then(function() {
        return es.lookup.id('cluster', id);
    });
}

function add(requester, profile, slug, data) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('node', id, requester, 'add').then(function() {
        return es.create('node', id, data);
    });
}

function patch(requester, profile, slug, patches) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('node', id, requester, 'patch').then(function() {
        return es.patch.id('node', id, patches);
    });
}

function remove(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('node', id, requester, 'remove').then(function() {
        return es.remove.id('node', id);
    });
}