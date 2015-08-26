var es = require('../utils/es-utils'),
    Q = require('q');

/**
 * Substitute a reference to an owner inside a response.
 *
 * @constructor
 */
function OwnerEnricher(store) {
    this.profileStorage = store.entity('profile');
    this.profiles = {};
}

OwnerEnricher.prototype.enrich = function(owner) {
    if (! owner) return owner;

    return this.profileStorage.get(owner, ['username', 'firstname', 'surname', 'email']).then(function(data) {
        var result = {
            id: data.id
        };

        if (data.data.username) result.username = data.data.username[0];
        if (data.data.firstname) result.firstname = data.data.firstname[0];
        if (data.data.surname) result.surname = data.data.surname[0];
        if (data.data.email) result.email = data.data.email[0];

        return result;
    });
};

module.exports = OwnerEnricher;