var Q = require('q'),
    Patcher = require('../storage/patcher');

module.exports.defaultDocumentHandler = function(doc) {
    var data = module.exports.documentFields(doc);

    return Q({
        id: doc._id,
        data: data,
        type: doc._type
    });
};

module.exports.documentFields = function(doc) {
    return (doc.fields) ? doc.fields : doc._source;
};

module.exports.formatResponse = function(res, documentHandler) {
    if (! documentHandler) documentHandler = module.exports.defaultDocumentHandler;

    if (res._source || res.fields) {
        return documentHandler(res);

    } else if (res.hits) {
        var array = [];
        res.hits.hits.forEach(function(hit) {
            array.push(documentHandler(hit));
        });

        if (res.aggregations) result.aggregations = res.aggregations;

        return Q.all(array).then(function(responses) {
            return {
                total: res.hits.total,
                data: responses
            };
        });
    } else {
        console.log('Unknown response type : ' + JSON.stringify(res));
    }
};

module.exports.value = function(hit, field) {
    return (hit.fields) ? hit.fields[field] : hit._source[field];
};

/**
 * TODO: This is some new functionality I added to make it easier to work with ES in the future. It is a replacement for the storage/entity framework.
 *
 * @param esClient
 * @param index
 * @returns {{id: Function, find: Function, search: Function, create: Function, patch: Function, remove: Function}}
 */
module.exports.wrapper = function(esClient, index) {
    return {
        id: function(type, id, fields) {
            var metadata = {
                index: index,
                type: type,
                id: id
            };

            if (fields) metadata.fields = fields;

            return Q(esClient.get(metadata));
        },
        find: function(type, field, value, fields) {
            var filter =  {term: {}};
            filter.term[field] = value;

            var req = {
                index: index,
                type: type,
                body: {
                    "query": {
                        "filtered": {
                            "query": { "match_all": {} },
                            "filter": filter
                        }
                    }
                }
            };

            if (fields) {
                req.fields = fields;
                req.body._source = fields;
            }

            return Q(this.esClient.search(req));
        },
        search: function(type, query, fields, paging) {
            var req = {
                index: index,
                type: type,
                fields: fields,
                body: query
            };

            if (paging) {
                if (paging.size) req.size = paging.size;
                if (paging.offset) req.from = paging.offset;
            } else {
                req.size = 25;
            }

            return Q(this.esClient.search(req));
        },
        create: function(type, data) {
            return Q(this.esClient.index({
                index: index,
                type: type,
                body: data
            }));
        },
        patch: function(type, id, patches) {
            var self = this;

            var metadata = {
                index: index,
                type: type,
                id: id
            };

            return Q(this.esClient.get(metadata).then(function(doc) {
                var resultDoc = Patcher.patch(doc._source, patches);

                return self.esClient.index({ index: self.storeId, type: self.type, id: id, retryOnConflict: 5, body: resultDoc});
            }));
        },
        remove: function(type, id) {
            return Q(this.esClient.delete({
                index: index,
                type: type,
                id: id
            }));
        }
    };
};