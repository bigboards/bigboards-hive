var ApiUtils = require('../utils/api-utils');

function PrivacyEnforcer(publicProperties, scopesField) {
    this.scopesField = scopesField || 'scopes';
    this.publicProperties = publicProperties;
}

PrivacyEnforcer.prototype.enforce = function(obj, requestedScope) {
    if (typeof obj === "array") {
        return this.enforceCollection(obj, requestedScope);
    } else {
        return this.enforceObject(obj, requestedScope);
    }
};

PrivacyEnforcer.prototype.enforceObject = function(obj, requestedScope) {
    var resultObject = {};
    var scopes = obj[this.scopesField];

    for (var prop in this.publicProperties) {
        if (! this.publicProperties.hasOwnProperty(prop)) continue;
        resultObject[this.publicProperties[prop]] = obj[this.publicProperties[prop]];
    }

    if (scopes) {
        for (var idx in scopes) {
            if (! scopes.hasOwnProperty(idx)) continue;

            var scope = scopes[idx];

            if (!this.isAuthorized(requestedScope, scope.scope)) continue;

            resultObject[scope.property] = obj[scope.property];
        }
    } else {
        return null;
    }
};

PrivacyEnforcer.prototype.enforceCollection = function(collection, requestedScope) {
    var result = [];

    for (var idx in collection) {
        var obj = this.enforce(collection[idx], requestedScope);
        if (obj) result.push(obj);
    }

    return result;
};

/**
 * Check if the data scope matches the requested scope.
 *
 *  Scopes match if the requested scope is a subset of the data scope or
 *  if the data and requested scope are the same.
 *
 * @param requestedScope    the requested scope
 * @param dataScope         the data scope
 */
PrivacyEnforcer.prototype.isAuthorized = function(requestedScope, dataScope) {
    return (ApiUtils.scopeLevel(requestedScope) - ApiUtils.scopeLevel(dataScope) >= 0);
};

module.exports = PrivacyEnforcer;