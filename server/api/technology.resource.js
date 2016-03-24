var TechnologyService = require('../services/technology.service'),
    TechnologyVersionService = require('../services/technology-version.service'),
    au = require('../utils/api-utils'),
    log4js = require('log4js'),
    Q = require('q');

var logger = log4js.getLogger('technology.resource');

module.exports = {
    suggest: suggest,
    filter: filter,
    get: get,
    add: add,
    patch: patch,
    remove: remove,
    versions: {
        suggest: suggestVersion,
        list: listVersions,
        get: getVersion,
        add: addVersion,
        patch: patchVersion,
        remove: removeVersion
    }
};

function suggest(req, res) {
    return au.handle(res, TechnologyService.suggest(req.requester, req.query.q));
}

function filter(req, res) {
    return au.handle(res, TechnologyService.filter(req.requester, req.query, au.paging(req)));
}

function get(req, res) {
    return au.handle(res, TechnologyService.get(req.requester, req.params.id, au.paging(req)));
}

function add(req, res) {
    logger.warn('requester on resource: ' + JSON.stringify(req.requester));
    return au.handle(res, TechnologyService.add(req.requester, req.params.id, req.body));
}

function patch(req, res) {
    return au.handle(res, TechnologyService.patch(req.requester, req.params.id, req.body));
}

function remove(req, res) {
    return au.handle(res,TechnologyService.remove(req.requester, req.params.id));
}

function suggestVersion(req, res) {
    return au.handle(res, TechnologyVersionService.suggest(req.requester, req.params.id, req.query.q));
}

function listVersions(req, res) {
    return au.handle(res, TechnologyVersionService.list(req.requester, req.params.id, au.paging(req)));
}

function getVersion(req, res) {
    return au.handle(res, TechnologyVersionService.get(req.requester, req.params.id, req.params.version));
}

function addVersion(req, res) {
    return au.handle(res, TechnologyVersionService.add(req.requester, req.params.id, req.params.version, req.body));
}

function patchVersion(req, res) {
    return au.handle(res, TechnologyVersionService.patch(req.requester, req.params.id, req.params.version, req.body));
}

function removeVersion(req, res) {
    return au.handle(res, TechnologyVersionService.remove(req.requester, req.params.id, req.params.version));
}