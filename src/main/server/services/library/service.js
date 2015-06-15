var Errors = require('../../errors'),
    yaml = require("js-yaml"),
    Q = require("q"),
    TintUtils = require('../../utils/tint-utils');

function LibraryService(storage, config) {
    this.storage = storage;
    this.config = config;
}

LibraryService.prototype.search = function(architecture, firmware, type, owner, queryString, paging) {
    var body = null;
    var query = null;

    var fields = [ "id", "owner", "slug", "name", "type", "description", "logo", "uri", "architecture", "supported_firmwares" ];

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

    if (architecture) {
        filters.push({"bool": { "should": [
            {"term": {"architecture": 'all'}},
            {"term": {"architecture": architecture}}
        ]}});
    }

    if (firmware) {
        filters.push({"term": {"supported_firmwares": firmware}});
    }

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
            "fields" : fields,
            "query": query
        };
    }

    return this.storage.library.search(body, paging);
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

    return Q.all([
        this.storage.library.get(id),
        this.storage[type].get(id)
    ]).then(function(results) {
        var res = results[0];
        res[type] = results[1];
        return res;
    });
};

LibraryService.prototype.add = function(data) {
    // -- split the data into two fragments. One fragment is the general data, the other is the type specific data
    var self = this;

    if (data[data.type]) {
        return this.storage[data.type].add(data[data.type])
            .then(function () {
                delete data[type];

                return self.storage.library.add(data);
            });
    } else {
        return this.storage.library.add(data);
    }
};

LibraryService.prototype.update = function(type, owner, slug, data) {
    var id = TintUtils.toTintId(type, owner, slug);

    // -- split the data into two fragments. One fragment is the general data, the other is the type specific data
    if (data[type]) {
        var self = this;
        return this.storage[type].update(id, data[type])
            .then(function () {
                delete data[type];

                return self.storage.library.add(id, data);
            });
    } else {
        return this.storage.library.add(id, data);
    }
};

LibraryService.prototype.remove = function(type, owner, slug) {
    var id = TintUtils.toTintId(type, owner, slug);

    // -- split the data into two fragments. One fragment is the general data, the other is the type specific data
    var self = this;
    return this.storage[type].remove(id)
        .then(function() {
            return self.storage.library.remove(id);
        });
};

LibraryService.prototype.manifest = function(type, owner, slug) {
    return this.get(type, owner, slug).then(function(tint) {
        return yaml.dump(tint);
    });
};

module.exports = LibraryService;