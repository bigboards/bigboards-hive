var AuthService = require('./service'),
    AuthResource = require('./resource');

module.exports.wire = function(context) {
    // -- register the auth-service
    context.registerFactory('service', 'auth-service', function (ctx) {
        return new AuthService(ctx.get('auth-storage'), ctx.get('profile-storage'));
    });

    // -- register the auth-resource
    context.registerFactory('resource', 'auth-resource', function(ctx) {
        return new AuthResource(ctx.get('auth-service'), ctx.get('response-handler'));
    });
};

module.exports.run = function(context) {
    var api = context.get('api');
    var resource = context.get('auth-resource');
    var config = context.get('config');

    var handleLogin = function(req, res) {
        res.redirect(config.frontend_url + '/#/login?token=' + req.user.token);
    };

    var options = {
        failureRedirect: config.frontend_url + '/#/login'
    };

    api.registerGet('/api/v1/auth/:token', function(req, res) { return resource.get(req, res); });
    api.registerDelete('/api/v1/auth/:token', function(req, res) { return resource.remove(req, res); });

    api.registerGet('/auth/github', api.passport().authenticate('github'));
    api.registerSecureGet('/auth/github/callback', api.passport().authenticate('github', options), handleLogin);

    api.registerGet('/auth/google', api.passport().authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
    api.registerSecureGet('/auth/google/callback', api.passport().authenticate('google', options), handleLogin);
};