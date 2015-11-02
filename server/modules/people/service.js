var Errors = require('../../errors');

function PeopleService(storage) {
    this.storage = storage;
}

PeopleService.prototype.search = function(queryString, paging) {
    var body = null;
    var query = null;

    var fields = [ "id", "name", "email" ];

    if (queryString) {
        query = {
            "simple_query_string" : {
                "query": queryString,
                "fields": [ "name" ]
            }
        }
    } else {
        query = {
            "match_all": {}
        }
    }

    var filters = [];

    filters.push({"type" : { "value" : "people" }});

    body = {
        "_source" : fields,
        "query": {
            "filtered": {
                "query": query,
                "filter": { "bool": { "must": filters } }
            }
        }
    };

    return this.storage.search(body, paging);
};

PeopleService.prototype.get = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.get(id);
};

PeopleService.prototype.getOrAdd = function(id, data) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    var self = this;
    return this.storage.get(id).then(function(profile) {
        if (profile) return profile;

        return self.add(data);
    });
};

PeopleService.prototype.add = function(data) {
    return this.storage.add(data);
};

PeopleService.prototype.update = function(id, data) {
    if (! id)
        throw new Errors.MissingParameterError('No member id has been provided');

    return this.storage.update(id, data);
};

PeopleService.prototype.remove = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.remove(id);
};

module.exports = PeopleService;