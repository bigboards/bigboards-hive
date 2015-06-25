var Q = require('q');

module.exports.formatResponse = function(res) {
    if (res._source || res.fields) {
        return module.exports.formatRecord(res);

    } else if (res.hits) {
        var array = [];
        res.hits.hits.forEach(function(hit) {
            array.push(module.exports.formatRecord(hit));
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

module.exports.formatRecord = function(hit) {
    var data = (hit.fields) ? hit.fields : hit._source;

    return Q({
        id: hit._id,
        data: data,
        type: hit._type
    });
};

module.exports.value = function(hit, field) {
    return (hit.fields) ? hit.fields[field] : hit._source[field];
};