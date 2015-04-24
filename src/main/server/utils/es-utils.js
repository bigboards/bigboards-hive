module.exports.formatResponse = function(res, privacyEnforcer, requestedScope) {
    if (res._source || res.fields) {
        return formatRecord(res, privacyEnforcer, requestedScope);

    } else if (res.hits) {
        var array = [];
        res.hits.hits.forEach(function(hit) {
            array.push(formatRecord(hit, privacyEnforcer, requestedScope));
        });

        var result = {
            total: res.hits.total,
            data: array
        };

        if (res.aggregations) result.aggregations = res.aggregations;

        return result;
    } else {
        console.log('Unknown response type : ' + JSON.stringify(res));
    }
};

function formatRecord(hit, privacyEnforcer, requestedScope) {
    var data = (hit.fields) ? hit.fields : hit._source;
    var enforced = false;

    if (privacyEnforcer) {
        data = privacyEnforcer.enforce(data, requestedScope);
        enforced = true;
    }

    return {
        id: hit._id,
        data: data,
        type: hit._type,
        enforced: enforced
    };
}