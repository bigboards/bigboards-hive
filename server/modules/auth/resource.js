var Errors = require('../../errors'),
    Q = require('q');

function AuthResource(service, responseHandler) {
    this.service = service;
    this.responseHandler = responseHandler;
}

AuthResource.prototype.get = function(req, res) {
    var token = req.params.token;

    if (token) {
        return this.responseHandler.handle(req, res, this.service.getUser(token));
    } else {
        return this.responseHandler.handle(req, res, Q(new Errors.MissingParameterError('No token provided!')));
    }
};

AuthResource.prototype.remove = function(req, res) {
    var token = req.params.token;

    if (token) {
        return this.responseHandler.handle(req, res, this.service.logout(token));
    } else {
        return this.responseHandler.handle(req, res, Q(new Errors.MissingParameterError('No token provided!')));
    }
};

module.exports = AuthResource;
