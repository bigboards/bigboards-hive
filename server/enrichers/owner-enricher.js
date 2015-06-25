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

OwnerEnricher.prototype.enrich = function(owner) {
    if (! owner) return owner;

    return this.profileStorage.get(owner);
};

module.exports = OwnerEnricher;