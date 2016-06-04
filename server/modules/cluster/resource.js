var Errors = require('../../errors'),
    Q = require('q');

function ClusterResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

ClusterResource.prototype.getClusters = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getClusters(req.user));
};

ClusterResource.prototype.getCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getCluster(req.params['clusterId']));
};

ClusterResource.prototype.getClusterDevices = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getClusterDevices(req.params['clusterId']));
};

ClusterResource.prototype.incubateCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.incubateCluster(req.body));
};

ClusterResource.prototype.pairCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.pairCluster(req.user, req.body['pair_code']));
};

ClusterResource.prototype.updateCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.updateCluster(req.params['clusterId'], req.body));
};

ClusterResource.prototype.removeCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.removeCluster(req.params['clusterId']));
};

ClusterResource.prototype.updateClusterDNS = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.updateClusterDNS(req.params['clusterId'], req.body));
};

module.exports = ClusterResource;
