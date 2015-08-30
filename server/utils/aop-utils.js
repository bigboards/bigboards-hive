module.exports.esResponseAdvice = function(context) {
    var esEnricher = context.get('es-enricher');
    var ownerEnricher = context.get('owner-enricher');

    return function(joinpoint) {
        return  joinpoint.proceed().then(function(result) {
            if (result._source || result.fields) {
                return module.exports.responseEnricher(result, esEnricher, ownerEnricher);

            } else if (result.hits) {
                var array = [];
                result.hits.hits.forEach(function(hit) {
                    array.push(module.exports.responseEnricher(hit, esEnricher, ownerEnricher));
                });

                return Q.all(array).then(function(responses) {
                    var response = {
                        total: result.hits.total,
                        data: responses
                    };

                    if (result.aggregations) response.aggregations = result.aggregations;

                    return response;
                });
            } else {
                throw new Error('Unknown response type : ' + JSON.stringify(result));
            }
        });
    }
};

module.exports.responseEnricher = function(hit, esEnricher, ownerEnricher) {
    // --  apply the owner enricher
    return esEnricher.enrich(hit)
        .then(function(data) { return ownerEnricher.enrich(data); })
        .then(function(data) { return { id: hit.id, data: data, type: hit._type }; })
        ;
};