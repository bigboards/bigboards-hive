var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function AuthResource(service) {
    this.service = service;
}

AuthResource.prototype.get = function(req, res) {
    var token = req.params.token;

    if (token) {
        return ApiUtils.handlePromise(res, this.service.getUser(token));
    } else {
        res.status(400).send('No token provided!');
    }
};

AuthResource.prototype.remove = function(req, res) {
    var token = req.params.token;

    if (token) {
        return ApiUtils.handlePromise(res, this.service.logout(token));
    } else {
        res.status(400).send('No token provided!');
    }
};

module.exports = AuthResource;
