var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    shortid = require('shortid');

module.exports = {
    list: list,
    add: add,
    get: get,
    patch: patch,
    remove: remove
};

function list(requester, technologyId, paging) {
    var req = {
        "query": {
            "has_parent": {
                "type": "technology",
                "query": {
                    "ids": {"type": "technology", "values": [technologyId]}
                }
            }
        }
    };

    return es.lookup.raw('technology_version', req, ['version', 'description', 'architecture'], paging);
}

function get(requester, technologyId, version) {
    su.param.exists('technologyId', technologyId);
    su.param.exists('version', version);

    var id = eu.id(technologyId, version);

    return es.access('technology_version', id, requester, 'get', technologyId).then(function() {
        return es.lookup.id('technology_version', id);
    });
}

function add(requester, technologyId, version, data) {
    su.param.exists('technologyId', technologyId);
    su.param.exists('version', version);
    su.param.exists('data', data);

    var id = eu.id(technologyId, version);

    return es.access('technology_version', id, requester, 'add', technologyId).then(function() {
        // todo: add validation for the data
        return es.create('technology_version', id, data, technologyId);
    });
}

function patch(requester, technologyId, version, patches) {
    su.param.exists('technologyId', technologyId);
    su.param.exists('version', version);

    var id = eu.id(technologyId, version);

    return es.access('technology_version', id, requester, 'patch', technologyId).then(function() {
        return es.patch.id('technology_version', id, patches);
    });
}

function remove(requester, technologyId, version) {
    su.param.exists('technologyId', technologyId);
    su.param.exists('version', version);

    var id = eu.id(technologyId, version);

    return es.access('technology_version', id, requester, 'patch', technologyId).then(function() {
        return es.remove.id('technology_version', id);
    });
}