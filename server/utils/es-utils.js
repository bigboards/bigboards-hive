var Q = require('q');

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