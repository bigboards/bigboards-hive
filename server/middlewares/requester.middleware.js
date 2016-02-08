var JWT = require('jsonwebtoken');
var log4js = require('log4js');

var config = require('../config/config.manager').lookup();
var logger = log4js.getLogger();

var secret = new Buffer(config.auth0.secret, 'base64');
var es = require('../es');
var Q = require('q');


module.exports = function(req, res, next) {
    var headerToken = req.header('Authorization');
    if (!headerToken) return next();

    var split = headerToken.split(' ');
    if (split[0] != 'Bearer') {
        return res.status(400).json('Invalid Authorization header: Authorization ' + split[0] + ' is not supported');
    }

    try {
        // -- extract the JWT from the header token
        var user = JWT.verify(split[1], secret);
        if (!user) {
            logger.debug('The jwt token could not be decrypted');
            return next();
        }

        var id = user.hive_id;
        logger.debug('Requester: ' + JSON.stringify(user, null, 2));
        logger.debug('Requester mapped to id ' + id);

        // -- check if the user is already in the store
        es.exists('profile', id)
            .then(function (exists) {
                if (! exists) {
                    log.info('creating profile with id ' + id);

                    return es.create('profile', id, {
                        id: id,
                        short_id: user.short_id,
                        name: user.name,
                        email: user.email,
                        permissions: (user.app_metadata && user.app_metadata.permissions) ? user.app_metadata.permissions : []
                    });
                } else return Q();
            })
            .then(function () {
                req.requester = {
                    id: id,
                    short_id: user.short_id,
                    name: user.name,
                    email: user.email,
                    permissions: (user.app_metadata && user.app_metadata.permissions) ? user.app_metadata.permissions : []
                };

                return next();
            })
            .fail(function (error) {
                logger.error(error);
                return next();
            });
    } catch(error) {
        return res.status(403).json({message: 'Invalid token'});
    }
};