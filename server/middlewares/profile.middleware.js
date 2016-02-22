var log4js = require('log4js');
var logger = log4js.getLogger("middleware.profile");

var es = require('../es');

module.exports = function(req, res, next) {
    if (req.requester) {
        es.exists('profile', req.requester.id).then(function (exists) {
            if (!exists) {
                logger.info('creating profile with id ' + id);

                return es.create('profile', id, {
                    id: id,
                    short_id: user.short_id,
                    name: user.name,
                    email: user.email,
                    permissions: (user.app_metadata && user.app_metadata.permissions) ? user.app_metadata.permissions : []
                }).then(function () {
                    logger.debug('User ' + id + ' created!');
                }, function (err) {
                    logger.error(err);
                });
            }
        })
    }

    next();
};