var ClusterService = require('../services/cluster.service'),
    au = require('../utils/api-utils');

module.exports = {
    filter: filter,
    nodes: getClusterNodes,
    get: getCluster,
    add: addCluster,
    patch: patchCluster,
    remove: removeCluster
};

function filter(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        ClusterService.filter(req.requester, req.body, au.paging(req))
    );
}

function getCluster(req, res) {
    return au.handle(
        res,
        au.guard.access(ClusterService.access(req.params.profile, req.params.id, req.requester, 'cluster:get')),
        ClusterService.filter(req.requester, req.body, au.paging(req))
    );
}

function addCluster(req, res) {
    return au.handle(
        res,
        au.guard.access(ClusterService.access(req.body.profile, req.body.id, req.requester, 'cluster:create')),
        ClusterService.create(req.body)
    );
}

function patchCluster(req, res) {
    return au.handle(
        res,
        au.guard.access(ClusterService.access(req.params.profile, req.params.id, req.requester, 'cluster:patch')),
        ClusterService.patch(req.params.profile, req.params.id, req.body)
    );
}

function removeCluster(req, res) {
    return au.handle(
        res,
        au.guard.access(ClusterService.access(req.params.profile, req.params.id, req.requester, 'cluster:remove')),
        ClusterService.remove(req.params.profile, req.params.id)
    );
}

function getClusterNodes(req, res) {
    return au.handle(
        res,
        au.guard.any(req),
        ClusterService.nodes(req.params.profile, req.params.id)
    );
}