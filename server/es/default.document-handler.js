var constants = require('../constants'),
    Q = require('q');

module.exports = function(profileCache) {
    return function(type, doc) {
        var data = (doc.fields) ? doc.fields :  doc._source;

        var entityType = constants.entityTypes[type];
        var collectionProperties = (entityType && entityType.collections) ? entityType.collections : [];

        return processObject(data).then(function(result) {
            return {
                id: doc._id,
                data: result,
                type: doc._type
            };
        });

        function processObject(obj) {
            var promises = [];

            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;

                // -- unwrap redundant arrays
                if (Array.isArray(obj[key]) && obj[key].length == 1 && (collectionProperties.indexOf(key) == -1)) {
                    obj[key] = obj[key][0];
                }

                if (Array.isArray(obj[key])) {
                    for (var idx in obj[key]) {
                        if (! obj[key].hasOwnProperty(idx)) continue;

                        (function(key, idx) {
                            promises.push(processObject(obj[key][idx]).then(function (res) {
                                obj[key][idx] = res;
                            }));
                        })(key, idx);
                    }
                } else if (obj[key] !== null && typeof obj[key] === 'object') {
                    (function(key) {
                        promises.push(processObject(obj[key]).then(function(res) {
                            obj[key] = res;
                        }));
                    })(key);
                }

                // -- replace the profile if found
                if (key == 'profile') {
                    promises.push(profileCache.get(obj[key]).then(function(profile) {
                        obj.profile = profile;
                    }));
                } else if (key == 'collaborators') {
                    if (Array.isArray(obj.collaborators)) {
                        obj.collaborators.forEach(function(collaborator) {
                            promises.push(profileCache.get(collaborator.profile).then(function(profile) {
                                collaborator.profile = profile;
                            }));
                        });
                    }
                }
            }

            if (promises.length > 0) {
                return Q.all(promises).then(function() {
                    return obj;
                });
            } else {
                return Q(obj);
            }
        }
    }
};