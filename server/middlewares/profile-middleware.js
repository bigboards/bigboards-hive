var log = require('winston');
var JWT = require('jsonwebtoken');

/**
 * A middleware to store new profiles into ES as they come in.
 *
 * @param config
 * @param profileStorage
 * @returns {Function}
 */
module.exports.profile = function(config, profileStorage) {
    var secret = new Buffer(config.auth0.clientSecret, 'base64');

    return function(req, res, next) {
        var headerToken = req.header('Authorization');
        if (!headerToken) return next();

        var split = headerToken.split(' ');
        if (split[0] != 'Bearer') return next();

        // -- extract the JWT from the header token
        var user = JWT.verify(split[1], secret);
        if (! user) return next();

        // -- check if the user is already in the store
        profileStorage
            .exists(user.hive_id)
            .then(function(exists) {
                if (exists) return null;

                log.log('info', 'Storing user "' + user.hive_id + '" in the hive data store');

                return profileStorage.add({
                    id: user.hive_id,
                    short_id: user.short_id,
                    name: user.name,
                    email: user.email
                }, user.hive_id);

            })
            .then(function() {
                req.user = user;
                return next();
            })
            .fail(function() { return next(); });
    };
};