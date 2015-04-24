var Errors = require('../../errors'),
    TintUtils = require('../../utils/tint-utils');

function TutorialService(storage) {
    this.storage = storage;
}

TutorialService.prototype.search = function(owner, queryString, paging) {
    var body = null;
    var query = null;

    if (queryString) {
        query = {
            "query_string": {"query": queryString}
        }
    } else {
        query = {
            "match_all": {}
        }
    }

    if (owner) {
        body = {
            "query": {
                "filtered": {
                    "query": query,
                    "filter": {
                        "term": { "owner": owner }
                    }
                }
            }
        };
    } else {
        body = {
            "query": query
        };
    }

    return this.storage.stack.search(body, paging);
};

TutorialService.prototype.get = function(owner, slug) {
    if (! owner)
        throw new Errors.MissingParameterError('No owner has been provided');

    if (! slug)
        throw new Errors.MissingParameterError('No slug has been provided');

    var id = TintUtils.toTintId(owner, slug);

    return this.storage.stack.get(id);
};

TutorialService.prototype.add = function(data) {
    data.id = TintUtils.toTintId(data.owner, data.slug);

    return this.storage.stack.add(data);
};

TutorialService.prototype.update = function(owner, slug, data) {
    if (! owner)
        throw new Errors.MissingParameterError('No owner has been provided');

    if (! slug)
        throw new Errors.MissingParameterError('No slug has been provided');

    var id = TintUtils.toTintId(owner, slug);

    return this.storage.stack.update(id, data);
};

TutorialService.prototype.remove = function(owner, slug) {
    if (! owner)
        throw new Errors.MissingParameterError('No owner has been provided');

    if (! slug)
        throw new Errors.MissingParameterError('No slug has been provided');

    var id = TintUtils.toTintId(owner, slug);

    return this.storage.stack.remove(id);
};

module.exports = TutorialService;