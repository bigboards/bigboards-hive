var Errors = require('../../errors'),
    TintUtils = require('../../utils/tint-utils');

function StackService(storage) {
    this.storage = storage;
}

StackService.prototype.search = function(type, owner, queryString, paging) {
    var body = null;
    var query = null;

    var fields = [ "id", "owner", "slug", "name", "type", "description", "logo", "uri" ];

    if (queryString) {
        query = {
            "bool": {
                "should": [
                    { "match": { "name": queryString } },
                    { "match": { "description": queryString } }
                ]
            }
        }
    } else {
        query = {
            "match_all": {}
        }
    }

    var filters = [];
    if (type) { filter.push({"term": {"type": type}}) }
    if (owner) { filter.push({"term": {"owner": owner}}) }

    if (filters.length > 0) {
        body = {
            "fields" : fields,
            "query": {
                "filtered": {
                    "query": query,
                    "filter": { "bool": { "must": filters } }
                }
            }
        };
    } else {
        body = {
            "fields" : fields,
            "query": query
        };
    }

    return this.storage.library.search(body, paging);
};

StackService.prototype.get = function(type, owner, slug) {
    if (! type)
        throw new Errors.MissingParameterError('No type has been provided');
    else if (! TintUtils.isValidType(type))
        throw new Errors.IllegalParameterError('Illegal tint type "' + type + '"');

    if (! owner)
        throw new Errors.MissingParameterError('No owner has been provided');

    if (! slug)
        throw new Errors.MissingParameterError('No slug has been provided');

    var id = TintUtils.toTintId(type, owner, slug);

    return Q.all([
        this.storage.library.get(id),
        this.storage[type].get(id)
    ]).then(function(results) {
        var res = results[0];
        res.details = results[1];
        return res;
    });
};

module.exports = StackService;