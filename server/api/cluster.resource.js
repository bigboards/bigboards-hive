var ClusterService = require('../services/cluster.service'),
    NodeService = require('../services/node.service'),
    au = require('../utils/api-utils');

module.exports = {
    filter: filter,
    get: getCluster,
    add: addCluster,
    patch: patchCluster,
    remove: removeCluster,
    nodes: {
        list: getClusterNodes
    }
};

function filter(req, res) {
    return au.handle(res, ClusterService.filter(req.requester, req.body, au.paging(req)));
}

function getCluster(req, res) {
    return au.handle(res, ClusterService.get(req.requester, req.params.id));
}

function addCluster(req, res) {
    return au.handle(res, ClusterService.add(req.requester, req.body));
}

function patchCluster(req, res) {
    return au.handle(res, ClusterService.patch(req.requester, req.params.id, req.body));
}

function removeCluster(req, res) {
    return au.handle(res, ClusterService.remove(req.requester, req.params.id));
}

function getClusterNodes(req, res) {
    return au.handle(res,NodeService.list.byCluster(req.requester, req.params.id, au.paging(req)));
}