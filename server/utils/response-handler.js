var es = require('../utils/es-utils'),
    Q = require('q');

function ResponseHandler(ownerEnricher) {
    this.ownerEnricher = ownerEnricher;
}

ResponseHandler.prototype.handle = function(req, res, promise) {
    var self = this;

    return promise
        .then(function(data) {
            return formatResponse(data, self.ownerEnricher);
        })
        .then(function(results) {
            var response = results;

            return res.json(response);
        })
        .fail(function(error) {
            error.isError = true;
            var msg = JSON.stringify(error, ['stack', 'name', 'message', 'inner', 'isError'], 4);

            if (error.name == 'AlreadyExistsError') {
                res.status(400).send(msg);
            } else if (error.name == 'IllegalParameterError') {
                res.status(400).send(msg);
            } else if (error.name == 'BadPayloadError') {
                res.status(400).send(msg);
            } else if (error.name == 'MissingParameterError') {
                res.status(400).send(msg);
            } else if (error.name == 'NotFoundError') {
                res.status(404).send(msg);
            } else if (error.name == 'InvalidTokenError') {
                res.status(403).send(msg);
            } else {
                res.status(500).send(msg);
            }
        });
};

function formatResponse(res, ownerEnricher) {
    if (res._source || res.fields) {
        return formatRecord(res, ownerEnricher);

    } else if (res.hits) {
        var array = [];
        res.hits.hits.forEach(function(hit) {
            array.push(formatRecord(hit, ownerEnricher));
        });

        if (res.aggregations) result.aggregations = res.aggregations;

        return Q.all(array).then(function(responses) {
            return {
                total: res.hits.total,
                data: responses
            };
        });
    } else {
        return Q(res);
    }
}

function formatRecord(hit, ownerEnricher) {
    var data = (hit.fields) ? hit.fields : hit._source;

    if (data.owner) {
        return ownerEnricher.enrich(data.owner).then(function(fullOwner) {
            if (fullOwner) data.owner = fullOwner;

            return {
                id: hit._id,
                data: data,
                type: hit._type
            }
        }).fail(function(err) {
            return {
                id: hit._id,
                data: data,
                type: hit._type
            };
        });
    } else {
        return Q({
            id: hit._id,
            data: data,
            type: hit._type
        });
    }
}

module.exports = ResponseHandler;