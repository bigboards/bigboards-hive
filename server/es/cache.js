var Q = require('q');

var lookupFn = null;
var lifetime = 0;
var cache = {};

module.exports = function(lookup, options) {
    if (! options) options = {};

    lookupFn = lookup;
    lifetime = options.lifetime | 60;

    return {
        get: getFromCache
    }
};

function getFromCache(id) {
    if (!id) return Q();
    if (!cache[id] || cache[id].ts < new Date()) {
        return lookupFn(id).then(function(result) {
            cache[id] = {exp: new Date(new Date().getTime() + (lifetime * 1000)), data: result.data};
            return result.data;
        });
    } else {
        return Q(cache[id].data);
    }
}

