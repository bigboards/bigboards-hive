var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function StackResource(service) {
    this.service = service;
}
/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/

StackResource.prototype.search = function(req, res) {
    var arch = 'all';
    if (req.get('BB-Architecture')) arch = req.get('BB-Architecture');
    if (req.query['architecture']) arch = req.query['architecture'];

    var firmware = null;
    if (req.get('BB-Firmware')) firmware = req.get('BB-Firmware');
    if (req.query['firmware']) firmware = req.query['firmware'];

    return ApiUtils.handlePromise(res, this.service.search(
        arch,
        firmware,
        req.query['t'],
        req.query['o'],
        req.query['q'],
        ApiUtils.parsePaging(req)
    ));
};

StackResource.prototype.get = function(req, res) {
    var format = req.query['format'];
    if (!format) {
        return ApiUtils.handlePromise(res, this.service.get(req.params['type'], req.params['owner'], req.params['slug']));
    } else if (format == 'yaml') {
        return ApiUtils.handlePromise(res, this.service.manifest(req.params['type'], req.params['owner'], req.params['slug']));
    } else {
        res.status(400).send('Invalid format value "' + format + "'");
    }
};

StackResource.prototype.add = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.add(req.body));
};

StackResource.prototype.update = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.update(req.params['type'], req.params['owner'], req.params['slug'], req.body));
};

StackResource.prototype.remove = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.remove(req.params['type'], req.params['owner'], req.params['slug']));
};

module.exports = StackResource;
