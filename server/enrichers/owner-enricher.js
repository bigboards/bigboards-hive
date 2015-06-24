var es = require('../utils/es-utils'),
    Q = require('q');

/**
 * Substitute a reference to an owner inside a response.
 *
 * @constructor
 */
function OwnerEnricher(profileStorage) {
    this.profileStorage = profileStorage;
    this.profiles = {};
}

OwnerEnricher.prototype.enrich = function(record) {
    if (! record.owner) return record;

    return this.profileStorage
        .get(record.owner)
        .then(function(profile) {
            record.owner = profile;

            return record;
        });
};

module.exports = OwnerEnricher;