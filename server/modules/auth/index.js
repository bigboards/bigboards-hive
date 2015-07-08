var AuthService = require('./service'),
    AuthResource = require('./resource');

module.exports.services = function(config, storages)  {
    return {
        auth: new AuthService(storages.auth, storages.profile)
    };
};

module.exports.resources = function(config, services, responseHandler) {
    return {
        auth: new AuthResource(services.auth, responseHandler)
    };
};

module.exports.run = function(config, api, resources)  {
    var resource = resources.auth;

    var handleLogin = function(req, res) {
        res.redirect(config['web/url'] + '/#/login?token=' + req.user.token);
        res.end();

        return res;
    };

    var options = {
        failureRedirect: config['web/url'] + '/#/login'
    };

    api.registerGet('/api/v1/auth/:token', function(req, res) { return resource.get(req, res); });
    api.registerDelete('/api/v1/auth/:token', function(req, res) { return resource.remove(req, res); });

    api.registerGet('/auth/github', api.passport().authenticate('github'));
    api.registerSecureGet('/auth/github/callback', api.passport().authenticate('github', options), handleLogin);

    api.registerGet('/auth/google', api.passport().authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
    api.registerSecureGet('/auth/google/callback', api.passport().authenticate('google', options), handleLogin);
};