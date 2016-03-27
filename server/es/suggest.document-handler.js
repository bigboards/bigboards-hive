var constants = require('../constants'),
    Q = require('q');

module.exports = function() {
    return function(type, doc) {
        var data = (doc.fields) ? doc.fields :  doc._source;

        for (var key in data) {
            if (!data.hasOwnProperty(key)) continue;

            // -- unwrap redundant arrays
            if (Array.isArray(data[key]) && data[key].length == 1) {
                data[key] = data[key][0];
            }
        }

        return Q({
            id: doc._id,
            data: data,
            type: doc._type
        });
    }
};