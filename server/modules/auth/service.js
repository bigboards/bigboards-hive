var Errors = require('../../errors'),
    Q = require('q'),
    uuid = require('node-uuid'),
    moment = require('moment');

function AuthService(authStorage, profileStorage) {
    this.authStorage = authStorage;
    this.profileStorage = profileStorage;
}

AuthService.prototype.getToken = function(tokenString) {
    return this.authStorage.get(tokenString);
};

AuthService.prototype.getUser = function(tokenString) {
    var self = this;

    return this.authStorage.get(tokenString)
        .then(function(t) {
            if (!t || !t.data) throw new Errors.NotFoundError("Invalid token '" + tokenString + "'");

            return self.profileStorage.get(t.data.profile_id);
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
        return this.authStorage.getToken(tokenString)
            .then(function(token) {
                if (!token || !token.data) throw new Errors.NotFoundError("Invalid token '" + tokenString + "'");

                if (moment().isAfter(token.data.expires)) {
                    return removeToken(self.authStorage, tokenString)
                        .then(function() { return false; })
                        .fail(function(err) { throw err; });
                } else {
                    return extendToken(self.authStorage, tokenString)
                        .then(function() { return true; })
                        .fail(function(err) { throw err; });
                }
            }).then(function(valid) {
                return { authenticated: valid };
            })
            .fail(function(error) { return {authenticated: false, error: error}; });
    } catch (error) {
        return Q({ authenticated: false, error: error });
    }
};

AuthService.prototype.login = function(profileId, tokenString, profileData) {
    var self = this;

    // -- make sure the profile id is a strinng
    profileId = '' + profileId;

    var handleProfile = function(profile) {
        return self.authStorage.set(tokenString, {
            profile_id: profileId,
            token: tokenString,
            exchanged: moment().format(),
            expires: moment().add(1, 'h').format()
        }, tokenString).then(function () {
            profile.token = tokenString;

            return profile;
        });
    };

    return this.profileStorage.get(profileId)
        .then(handleProfile)
        .fail(function(error) {
            if (error.status != 404 && error.name != 'NotFoundError') throw error;

            return self.profileStorage.add(profileData, profileId)
                .then(handleProfile);
        });
};

AuthService.prototype.logout = function(token) {
    return this.authStorage.remove(token);
};

module.exports = AuthService;

function removeToken(Auth, tokenString) {
    return Auth.remove(tokenString)
        .then(function() { return false; })
        .fail(function(err) {
            throw new Error('Unable to remove the expired authorization data for ' + tokenString + ': ' + err.message);
        });
}

function extendToken(Auth, tokenString) {
    return Auth.update(tokenString, { expires: moment().add(1, 'h').format() })
        .then(function() { return true; })
        .fail(function(err) {
            throw new Error('Unable to remove the expired authorization data for ' + tokenString + ': ' + err.message);
        });
}