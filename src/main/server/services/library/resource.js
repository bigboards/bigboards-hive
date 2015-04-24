var ApiUtils = require('../../utils/api-utils'),
    TintUtils = require('../../utils/tint-utils'),
    Q = require('q');

function StackResource(service) {
    this.service = service;
}
/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/

StackResource.prototype.search = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.search(
        req.params['type'],
        req.params['owner'],
        req.params['q'],
        ApiUtils.parsePaging(req)
    ));
};

StackResource.prototype.get = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.get(req.params['owner'], req.params['slug']));
};

module.exports = StackResource;
