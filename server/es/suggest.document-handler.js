var constants = require('../constants'),
    Q = require('q');

module.exports = function() {
    return function(type, doc) {
        var data = (doc.fields) ? doc.fields :  doc._source;

        var entityType = constants.entityTypes[type];
        var res = data[entityType.suggestField];
        if (Array.isArray(res) && res.length == 1) res = res[0];

        return Q({
            id: doc._id,
            suggest: res,
            type: doc._type
        });
    }
};