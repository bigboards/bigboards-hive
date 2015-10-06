var Errors = require('../../errors'),
    Q = require('q');

function LinkResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

LinkResource.prototype.get = function(req, res) {

    return this.responseHandler.handle(req, res, this.service.get(req.user));
};

module.exports = LinkResource;
