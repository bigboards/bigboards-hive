var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function ProfileResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

ProfileResource.prototype.search = function(req, res) {
    var q = null;
    if (req.params['q']) {
        q = req.params['q'] + '*';
    }

    return this.responseHandler.handle(req, res, this.service.search(
        q,
        ApiUtils.parsePaging(req)
    ));
};

ProfileResource.prototype.get = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.get(req.params['id']));
};

ProfileResource.prototype.add = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.add(req.body));
};

ProfileResource.prototype.update = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.update(req.params['id'], req.body));
};

ProfileResource.prototype.remove = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.remove(req.params['id']));
};

module.exports = ProfileResource;
