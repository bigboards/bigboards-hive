var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    log4js = require('log4js'),
    shortid = require('shortid');

var logger = log4js.getLogger('technology.service');

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
    logger.warn('requester on service: ' + JSON.stringify(requester));

    su.param.exists('id', id);
    su.param.exists('data', data);

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