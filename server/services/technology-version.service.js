var eu = require('../utils/entity-utils'),
    es = require('../es'),
    su = require('../utils/service-utils'),
    filterBuilder = require('../es/filter-builder'),
    suggestBuilder = require('../es/suggest-builder'),
    shortid = require('shortid'),
    log4js = require('log4js');

var logger = log4js.getLogger('service.technology-version');

module.exports = {
    suggest: suggest,
    list: list,
    add: add,
    get: get,
    patch: patch,
    remove: remove
};

function suggest(requester, technologyId, query) {
    var suggest = suggestBuilder.build('technology_version', requester, {_parent: technologyId}, query, false, false, false);

    return es.lookup.suggest('technology_version', suggest);
}

function list(requester, technologyId, paging) {
    var req = {
        "query": {
            "term": { _parent: technologyId }
        }
    };

    return es.lookup.raw('technology_version', req, ['version', 'description', 'architecture'], paging);
}

function get(requester, technologyId, version) {
    su.param.exists('technologyId', technologyId);
    su.param.exists('version', version);

    var id = eu.id(technologyId, version);

    return es.access('technology_version', id, requester, 'get', technologyId).then(function() {
        return es.lookup.id('technology_version', id, technologyId);
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
        return es.patch.id('technology_version', id, patches, technologyId);
    });
}

function remove(requester, technologyId, version) {
    su.param.exists('technologyId', technologyId);
    su.param.exists('version', version);

    var id = eu.id(technologyId, version);

    return es.access('technology_version', id, requester, 'patch', technologyId).then(function() {
        return es.remove.id('technology_version', id, technologyId);
    });
}