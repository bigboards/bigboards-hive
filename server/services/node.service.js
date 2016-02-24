var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    Q = require('q'),
    gpc = require('generate-pincode'),
    Errors = require('../errors');

module.exports = {
    list: {
        byFilter: listByFilter,
        byCluster: listByCluster
    },
    add: add,
    get: get,
    patch: patch,
    remove: remove,
    link: link
};

function listByFilter(requester, criteria, paging) {
    var filter = filterBuilder.build(requester, criteria, false, true, true);
    return es.lookup.raw('cluster', filter, null, paging);
}

function listByCluster(requester, clusterId, paging) {
    return listByFilter(requester, {cluster: clusterId}, paging);
}

function get(requester, profile, slug) {
    su.param.exists('profile', profile);
    su.param.exists('slug', slug);

    var id = eu.id(profile, slug);

    return es.access('cluster', id, requester, 'get').then(function() {
        return es.lookup.id('cluster', id);
    });
}

function add(requester, data) {
    var id = data.mac.replace(/\:/g, '').toLowerCase();

    return es.create('node', id, data).then(function(response) { return response; }, function(error) {
        if (error.status == 409)
            throw new Errors.AlreadyExistsError("A node with the same mac address was already registered");

        throw error;
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

function link(requester, pin) {
    su.param.exists('pin', pin);

    if (!requester)
        return Q.reject(new Errors.OperationNotAllowed("You must be logged in to link nodes to your account."));

    var filter = filterBuilder.build(requester, {pin: pin}, false, false, false);

    // -- find the node with the given pin
    return es.lookup.raw('node', filter).then(function(results) {
        if (results.hits.length == 1) {
            var res = results.hits[0];

            return es.patch.id('node', res.id, [
                { op: 'set', fld: 'profile', val: requester.id}
            ]).then(function(result) {
                return { "ok": true }
            }, function(error) {
                throw new Errors.InvalidTokenError("Unable to update the node with the owner information.");
            });
        } else {
            throw new Errors.InvalidTokenError("The given pin code could be linked to multiple devices. Please contact support to solve this.");
        }
    }, function(error) {
        if (error.status == 404)
            throw new Errors.NotFoundError("Unable to find a device with that pin number");

        throw error;
    });
}