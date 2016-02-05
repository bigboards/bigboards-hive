var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    shortid = require('shortid');

module.exports = {
    filter: filter,
    add: add,
    get: get,
    patch: patch,
    remove: remove
};

function filter(requester, criteria, paging) {
    var filter = filterBuilder.build(requester, criteria, true, false, false);

    return es.lookup.raw('technology', filter, ['scope', 'name', 'logo', 'description'], paging);
}

function get(requester, id) {
    su.param.exists('id', id);

    return es.access('technology', id, requester, 'get').then(function() {
        return es.lookup.id('technology', id);
    });
}

function add(requester, id, data) {
    su.param.exists('id');
    su.param.exists('data');

    return es.access('technology', id, requester, 'add').then(function() {
        // todo: add validation for the data
        return es.create('technology', id, data);
    });
}

function patch(requester, id, patches) {
    su.param.exists('id', id);

    return es.access('technology', id, requester, 'patch').then(function() {
        return es.patch.id('technology', id, patches);
    });
}

function remove(requester, id) {
    su.param.exists('id', id);

    return es.access('technology', id, requester, 'patch').then(function() {
        return es.remove.id('technology', id);
    });
}