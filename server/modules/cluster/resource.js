var Errors = require('../../errors'),
    Q = require('q');

function ClusterResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

ClusterResource.prototype.clusterExists = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.clusterExists(req.query['name']));
};

ClusterResource.prototype.getClusters = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getClusters(req.user));
};

ClusterResource.prototype.getCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getCluster(req.params['clusterId']));
};

ClusterResource.prototype.getClusterDevices = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.getClusterDevices(req.params['clusterId']));
};

ClusterResource.prototype.addCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.addCluster(req.user, req.body));
};

ClusterResource.prototype.updateCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.updateCluster(req.params['clusterId'], req.body));
};

ClusterResource.prototype.removeCluster = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.removeCluster(req.params['clusterId']));
};

ClusterResource.prototype.connectClusterDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.connectClusterDevice(req.params['clusterId'], req.params['deviceId']));
};

ClusterResource.prototype.disconnectClusterDevice = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.disconnectClusterDevice(req.params['clusterId'], req.params['deviceId']));
};

module.exports = ClusterResource;
