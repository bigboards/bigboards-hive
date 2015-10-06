var Errors = require('../../errors'),
    yaml = require("js-yaml"),
    Q = require("q"),
    TintUtils = require('../../utils/tint-utils'),
    esUtils = require('../../utils/es-utils'),
    JsUtils = require('../../utils/js-utils');

function LibraryService(storage) {
    this.storage = storage;
}

LibraryService.prototype.search = function(architecture, firmware, type, owner, scope, queryString, paging) {
    var body = null;
    var query = null;

    var fields = [ "id", "owner", "owner_name", "slug", "name", "type", "description", "logo", "uri", "architecture", "supported_firmwares" ];

    if (queryString) {
        query = {
            "simple_query_string" : {
                "query": queryString,
                "fields": [ "name", "description" ]
            }
        }
    } else {
        query = {
            "match_all": {}
        }
    }

    var filters = [];
    if (type) { filters.push({"term": {"type": type}}) }
    if (owner) { filters.push({"term": {"owner": owner}}) }
    if (scope) { filters.push({"term": {"scope": scope}}) }

    if (architecture && architecture != 'all') {
        filters.push({"bool": { "should": [
            {"term": {"architecture": 'all'}},
            {"term": {"architecture": architecture}}
        ]}});
    }

    if (firmware) {
        filters.push({"term": {"supported_firmwares": firmware}});
    }

    filters.push({"type" : { "value" : "library-item" }});

    if (filters.length > 0) {
        body = {
            "_source" : fields,
            "query": {
                "filtered": {
                    "query": query,
                    "filter": { "bool": { "must": filters } }
                }
            }
        };
    } else {
        body = {
            "_source" : fields,
            "fields" : fields,
            "query": query
        };
    }

    return this.storage.search(body, paging);
};

LibraryService.prototype.get = function(type, owner, slug) {
    if (! type)
        throw new Errors.MissingParameterError('No type has been provided');
    else if (! TintUtils.isValidType(type))
        throw new Errors.IllegalParameterError('Illegal tint type "' + type + '"');

    if (! owner)
        throw new Errors.MissingParameterError('No owner has been provided');

    if (! slug)
        throw new Errors.MissingParameterError('No slug has been provided');

    var id = TintUtils.toTintId(type, owner, slug);

    return this.storage.get(id, null, function(doc) {
        var data = esUtils.documentFields(doc);

        if (data.stack && data.stack.length > 0) data.stack = data.stack[0];
        if (data.tutorial && data.tutorial.length > 0) data.tutorial = data.tutorial[0];
        if (data.dataset && data.dataset.length > 0) data.dataset = data.dataset[0];

        return Q({
            id: doc._id,
            data: data,
            type: doc._type
        });
    });
};

LibraryService.prototype.add = function(data) {
    var id = TintUtils.toTintId(data.type, data.owner, data.slug);
    return this.storage.add(data, id);
};

LibraryService.prototype.update = function(type, owner, slug, data) {
    var id = TintUtils.toTintId(type, owner, slug);
    return this.storage.update(id, data);
};

LibraryService.prototype.remove = function(type, owner, slug) {
    var id = TintUtils.toTintId(type, owner, slug);
    return this.storage.remove(id);
};

LibraryService.prototype.manifest = function(type, owner, slug) {
    return this.get(type, owner, slug).then(function(tint) {
        return yaml.dump(tint);
    });
};

module.exports = LibraryService;