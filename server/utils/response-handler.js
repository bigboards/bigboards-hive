var es = require('../utils/es-utils'),
    Q = require('q');

function ResponseHandler(ownerEnricher) {
    this.ownerEnricher = ownerEnricher;
}

ResponseHandler.prototype.handle = function(req, res, promise) {
    return promise
        .then(es.formatResponse)
        .then(function(data) {
            if (data._source || data.fields) {
                return handleHit(data);

            } else if (data.hits) {
                var promises = [];

                data.hits.hits.forEach(function(hit) {
                    promises.push(handleHit(hit));
                });

                return Q.all(promises).then(function(results) {
                    var result = {
                        total: data.hits.total,
                        data: results
                    };

                    if (data.aggregations) result.aggregations = data.aggregations;

                    return result;
                });

            } else {
                console.log('Unknown response type : ' + JSON.stringify(res));
            }
        });
};

function handleHit(hit) {
    var self = this;

    return es.formatRecord(hit)
        .then(function(record) {
            if (! record.owner) return record;

            return self.ownerEnricher.enrich(record);
        });
}

module.exports = ResponseHandler;