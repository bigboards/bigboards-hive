var Errors = require('../../errors');

function ProfileService(storage) {
    this.storage = storage;
}

ProfileService.prototype.search = function(queryString, paging) {
    var query = { "match_all": {} };

    if (queryString) {
        query = {
            "query_string": {"query": queryString}
        }
    }

    return this.storage.search({ query: query }, paging);
};

ProfileService.prototype.get = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.get(id);
};

ProfileService.prototype.getOrAdd = function(id, data) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    var self = this;
    return this.storage.get(id).then(function(profile) {
        if (profile) return profile;

        return self.add(data);
    });
};

ProfileService.prototype.add = function(data) {
    return this.storage.add(data);
};

ProfileService.prototype.update = function(id, data) {
    if (! id)
        throw new Errors.MissingParameterError('No member id has been provided');

    return this.storage.update(id, data);
};

ProfileService.prototype.remove = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.remove(id);
};

module.exports = ProfileService;