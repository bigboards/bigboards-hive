var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder');

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

function getCluster(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('cluster', id, requester, 'get').then(function() {
        return es.lookup.id('cluster', id);
    });
}

function addCluster(requester, profile, slug, data) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('cluster', id, requester, 'add').then(function() {
        return es.create('cluster', id, data);
    });
}

function patchCluster(requester, profile, slug, patches) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('cluster', id, requester, 'patch').then(function() {
        return es.patch.id('cluster', id, patches);
    });
}

function removeCluster(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('cluster', id, requester, 'remove').then(function() {
        return es.remove.id('cluster', id);
    });
}