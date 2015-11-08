var Q = require('q'),
    esUtils = require('../../utils/es-utils');

/**
 * Create a new Storage implementation.
 *
 * @param esClient      the elasticsearch client
 * @param index         the index in elasticsearch
 * @param type          the type inside the elasticsearch index
 * @param publicFields  an array with fields of the type that may be publicly readable. if publicFields is falsely, all
 *                      fields are considered to be public.
 *
 * @constructor
 */
function Storage(esClient, index, type, publicFields) {
    this.index = index;
    this.type = type;
    this.esClient = esClient;
    this.publicFields = publicFields;
}

Storage.prototype.search = function(query, paging) {
    var req = {
        index: this.index,
        type: this.type,
        body: query
    };

    if (this.publicFields) {
        req.fields = this.publicFields;
    }

    if (paging) {
        if (paging.size) req.size = paging.size;
        if (paging.offset) req.from = paging.offset;
    } else {
        req.size = 25;
    }

    return Q(this.esClient.search(req))
        .then(function(response) {
            return esUtils.formatResponseLegacy(response);
        });
};

Storage.prototype.get = function(id) {
    var self = this;

    return Q(this.esClient
        .get({ index: this.index, type: this.type, id: id})
        .then(function(data) {
            return esUtils.formatResponseLegacy(data);
        }));
};

Storage.prototype.set = function(id, data) {
    var self = this;
    return Q(this.esClient.index({ index: this.index, type: this.type, id: id, body: data }))
        .then(function(response) {
            return self.get(response._id);
        });
};

Storage.prototype.add = function(data, id) {
    var request = {
        index: this.index,
        type: this.type,
        body: data
    };

    if (id) request.id = id;

    var self = this;
    return Q(this.esClient.create(request))
        .then(function(response) {
            return self.get(response._id);
        });
};

Storage.prototype.addImmediately = function(data) {
    var self = this;
    return Q(this.esClient.index({ index: this.index, type: this.type, body: data, refresh: true }))
        .then(function(response) {
            return self.get(response._id);
        });
};

Storage.prototype.multiAdd = function(data) {
    var body = [];

    for (var i in data) {
        body.push({ index:  { _index: this.index, _type: this.type } });
        body.push(data[i]);
    }

    return Q(this.esClient.bulk({
        body: body
    }));
};

Storage.prototype.update = function(id, data) {
    var self = this;
    return Q(this.esClient.update({ index: this.index, type: this.type, id: id, body: { doc: data } }))
        .then(function(response) {
            return self.get(response._id);
        });
};

Storage.prototype.remove = function(id) {
    var self = this;

    return self
        .get(id)
        .then(function(obj) {
            return Q(self.esClient.delete({ index: self.index, type: self.type, id: id }))
                .then(function() {
                    return true;
                });
        }).fail(function(error) {
            if (error.message == 'Not Found') {
                return false;
            } else {
                throw error;
            }
        });
};

module.exports = Storage;


