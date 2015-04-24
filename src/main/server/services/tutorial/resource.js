var ApiUtils = require('../../utils/api-utils'),
    TintUtils = require('../../utils/tint-utils'),
    Q = require('q');

function TutorialResource(service) {
    this.service = service;
}
/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/

TutorialResource.prototype.search = function(req, res) {
    var owner = req.params['owner'];

    var q = null;
    if (req.params['q']) {
        q = req.params['q'] + '*';
    }

    return ApiUtils.handlePromise(res, this.service.search(
        q,
        ApiUtils.parsePaging(req)
    ));
};

TutorialResource.prototype.get = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.get(req.params['owner'], req.params['slug']));
};

TutorialResource.prototype.add = function(req, res) {
    var data = req.body;
    data.owner = req.user;

    return ApiUtils.handlePromise(res, this.service.add(data));
};

TutorialResource.prototype.update = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.update(req.user, req.params['slug'], req.body));
};

TutorialResource.prototype.remove = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.remove(req.user, req.params['slug']));
};

module.exports = TutorialResource;
