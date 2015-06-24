var Errors = require('../../errors'),
    Q = require('q'),
    uuid = require('node-uuid'),
    moment = require('moment');

function AuthService(storage) {
    this.storage = storage;
}

AuthService.prototype.getToken = function(tokenString) {
    return this.storage.auth.get(tokenString);
};

AuthService.prototype.getUser = function(tokenString) {
    var self = this;

    return this.storage.auth.get(tokenString)
        .then(function(t) {
            if (!t || !t.data) throw new Errors.NotFoundError("Invalid token '" + tokenString + "'");

            return self.storage.profile.get(t.data.profile_id);
        }).fail(function(error) {
            if (error.message == 'Not Found') {
                throw new Errors.NotFoundError('A valid authentication token could not be found.');
            } else {
                throw error;
            }
        });
};

AuthService.prototype.isAuthenticated = function(tokenString) {
    var self = this;
    try {
        return this.getUser(tokenString)
            .then(function(profile) {
                return self.storage.auth.update(tokenString, {
                    valid_from: moment().format()
                }).then(function() {
                    return { authenticated: true, profile: profile };
                });
            })
            .fail(function(error) { return {authenticated: false, error: error}; });
    } catch (error) {
        return Q({ authenticated: false, error: error });
    }
};

AuthService.prototype.login = function(profileId, tokenString, profileData) {
    var self = this;

    var handleProfile = function(profile) {
        return self.storage.auth.add({
            profile_id: profileId,
            token: tokenString,
            "valid_from": moment().format()
        }, tokenString).then(function () {
            profile.token = tokenString;

            return profile;
        });
    };

    return this.storage.profile.get(profileId)
        .then(handleProfile)
        .fail(function(error) {
            if (error.status != 404 && error.name != 'NotFoundError') throw error;

            return self.storage.profile.add(profileData, profileId)
                .then(handleProfile);
        });
};

AuthService.prototype.logout = function(token) {
    return this.storage.auth.remove(token);
};

module.exports = AuthService;