var NodeService = require('../services/node.service'),
    au = require('../utils/api-utils'),
    eu = require('../utils/entity-utils');

module.exports = {
    list: {
        filter: listByFilter
    },
    get: get,
    add: add,
    patch: patch,
    remove: remove
};

function listByFilter(req, res) {
    return au.handle(res, NodeService.list.byFilter(req.requester, req.body, au.paging(req)));
}

function get(req, res) {
    return au.handle(res, NodeService.get(req.requester, req.requester.hive_id, req.params.slug));
}

function add(req, res) {
    return au.handle(res, NodeService.add(req.requester, req.params.profile, req.params.slug, req.body));
}

function patch(req, res) {
    return au.handle(res, NodeService.patch(req.requester, req.params.profile, req.params.slug, req.body));
}

function remove(req, res) {
    return au.handle(res, NodeService.remove(req.requester, req.params.profile, req.params.slug));
}