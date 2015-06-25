var es = require('../utils/es-utils'),
    Q = require('q');

/**
 * Substitute the result object with a decent json object.
 *
 * @constructor
 */
function EsEnricher() { }

EsEnricher.prototype.enrich = function(hit) {
    return Q((hit.fields) ? hit.fields : hit._source);
};

module.exports = EsEnricher;