var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function PeopleResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

PeopleResource.prototype.search = function(req, res) {
    var q = null;
    if (req.query['q']) {
        q = req.query['q'] + '*';
    }

    return this.responseHandler.handle(req, res, this.service.search(
        q,
        ApiUtils.parsePaging(req)
    ));
};

PeopleResource.prototype.get = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.get(req.params['id']));
};

PeopleResource.prototype.add = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.add(req.body));
};

PeopleResource.prototype.update = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.update(req.params['id'], req.body));
};

PeopleResource.prototype.remove = function(req, res) {
    return this.responseHandler.handle(req, res, this.service.remove(req.params['id']));
};

module.exports = PeopleResource;
