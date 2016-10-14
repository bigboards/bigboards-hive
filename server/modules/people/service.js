var Errors = require('../../errors'),
    esu = require('../../utils/es-utils'),
    Log = require('winston');

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

/**
 * Check if a user with the given shortId already exists.
 *
 * @param shortId  The shortId of the user to look for
 */
PeopleService.prototype.exists = function(shortId) {
    var body = {
        "query": {
            "filtered": {
                "query": {
                    "match_all": {}
                },
                "filter": {
                    "term": {
                        "short_id": shortId
                    }
                }
            }
        }
    };

    return this.storage.count(body).then(function(count) {
        return {
            exists: count > 0
        }
    })
};

PeopleService.prototype.get = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.get(id);
};

PeopleService.prototype.getByShortId = function(shortId) {
    if (! shortId)
        throw new Errors.MissingParameterError('No shortId id has been provided');

    var filters = [];
    filters.push({"type" : { "value" : "people" }});
    filters.push({"term" : { "short_id" : shortId }});

    return this.storage.search({
        "query": {
            "filtered": {
                "query": {"match_all": {}},
                "filter": { "bool": { "must": filters } }
            }
        }
    }).then(function(results) {
        if (results.total == 0) return null;
        if (results.total == 1) {
            return results.data[0];
        }

        Log.log('warn', '!!!DATA INCONSISTENCY!!! Short-id "' + shortId + '" maps to ' + results.total + ' people!');
        return null;
    });
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