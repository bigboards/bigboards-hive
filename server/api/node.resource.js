var NodeService = require('../services/node.service'),
    au = require('../utils/api-utils'),
    eu = require('../utils/entity-utils'),
    API = require('./api-helper');

module.exports = {
    list: {
        filter: listByFilter
    },
    get: get,
    add: add,
    patch: patch,
    remove: remove,
    link: link
};

function listByFilter(req, res) {
    return API.handle.service(res, NodeService.list.byFilter(req.requester, req.body, au.paging(req)));
}

function get(req, res) {
    return API.handle.service(res, NodeService.get(req.requester, req.requester.hive_id, req.params.slug));
}

function add(req, res) {
    return API.handle.service(res, NodeService.add(req.requester, req.body));
}

function patch(req, res) {
    return API.handle.service(res, NodeService.patch(req.requester, req.params.profile, req.params.slug, req.body));
}

function remove(req, res) {
    return API.handle.service(res, NodeService.remove(req.requester, req.params.profile, req.params.slug));
}

function link(req, res) {
    return API.handle.service(res, NodeService.link(req.requester, req.params.pin));
}