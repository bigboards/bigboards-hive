var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function StackResource(service) {
    this.service = service;
}
/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/

StackResource.prototype.search = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.search(
        req.get('BB-Architecture'),
        req.get('BB-Firmware'),
        req.params['type'],
        req.params['owner'],
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

module.exports = StackResource;
