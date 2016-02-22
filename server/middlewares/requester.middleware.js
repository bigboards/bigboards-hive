var JWT = require('jsonwebtoken');
var log4js = require('log4js');

var config = require('../config/config.manager').lookup();
var logger = log4js.getLogger("middleware.requester");

var secret = new Buffer(config.auth0.secret, 'base64');

module.exports = function(req, res, next) {
    var headerToken = req.header('Authorization');
    if (!headerToken) next();
    else {
        var split = headerToken.split(' ');
        if (split[0] == 'Bearer') {
            try {
                // -- extract the JWT from the header token
                var user = JWT.verify(split[1], secret);
                if (user) {
                    var id = user.hive_id;

                    req.requester = {
                        id: id,
                        short_id: user.short_id,
                        name: user.name,
                        email: user.email,
                        permissions: (user.app_metadata && user.app_metadata.permissions) ? user.app_metadata.permissions : []
                    };

                    logger.info('User ' + req.requester.id + ' authenticated with permissions ' + JSON.stringify(req.requester.permissions));

                    next();
                } else {
                    res.status(403).json({message: 'The token could not be decrypted'});
                    res.end();
                }
            } catch (error) {
                res.status(403).json({message: 'Invalid token'});
                res.end();
            }
        } else {
            res.status(400).json('Invalid Authorization header: Authorization ' + split[0] + ' is not supported');
            res.end();
        }
    }
};