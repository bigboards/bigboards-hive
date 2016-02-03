var NodeService = require('../services/node.service'),
    au = require('../utils/api-utils'),
    eu = require('../utils/entity-utils');

module.exports = {
    list: {
        byFilter: listByFilter,
        byCluster: listByCluster
    },
    get: get,
    add: add,
    patch: patch,
    remove: remove
};

function listByFilter(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        NodeService.filter(req.requester, req.body, au.paging(req))
    );
}

function listByCluster(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        NodeService.filter(req.requester, {cluster: eu.id(req.params.profile, req.params.cluster)}, au.paging(req))
    );
}

function get(req, res) {
    return au.handle(
        res,
        au.guard.access(NodeService.access(req.params.profile, req.params.id, req.requester, 'node:get')),
        NodeService.filter(req.requester, req.body, au.paging(req))
    );
}

function add(req, res) {
    return au.handle(
        res,
        au.guard.access(NodeService.access(req.body.profile, req.body.id, req.requester, 'node:create')),
        NodeService.create(req.body)
    );
}

function patch(req, res) {
    return au.handle(
        res,
        au.guard.access(NodeService.access(req.params.profile, req.params.id, req.requester, 'node:patch')),
        NodeService.patch(req.params.profile, req.params.id, req.body)
    );
}

function remove(req, res) {
    return au.handle(
        res,
        au.guard.access(NodeService.access(req.params.profile, req.params.id, req.requester, 'node:remove')),
        NodeService.remove(req.params.profile, req.params.id)
    );
}