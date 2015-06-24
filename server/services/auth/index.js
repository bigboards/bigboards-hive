var AuthService = require('./service'),
    AuthResource = require('./resource'),
    AuthLinker = require('./linker');

module.exports.wire = function(context) {
    // -- register the auth-service
    context.registerFactory('service', 'auth-service', function (ctx) {
        return new AuthService(ctx.get('storage'));
    });

    // -- register the auth-resource
    context.registerFactory('resource', 'auth-resource', function(ctx) {
        return new AuthResource(ctx.get('auth-service'));
    });

    // -- register the auth-linker
    context.registerFactory('linker', 'auth-linker', function (ctx) {
        return new AuthLinker(
            ctx.get('api'),
            ctx.get('auth-resource')
        );
    });
};

module.exports.run = function(context) {
    var api = context.get('api');
    var resource = context.get('auth-resource');

    var handleLogin = function(req, res) {
        res.redirect('/#/login?token=' + req.user.token);
    };

    api.registerGet('/api/v1/auth/:token', function(req, res) { return resource.get(req, res); });
    api.registerDelete('/api/v1/auth/:token', function(req, res) { return resource.remove(req, res); });

    api.registerGet('/auth/github', api.passport().authenticate('github'));
    api.registerSecureGet('/auth/github/callback', api.passport().authenticate('github', { failureRedirect: '/#/login' }), handleLogin);

    api.registerGet('/auth/google', api.passport().authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
    api.registerSecureGet('/auth/google/callback', api.passport().authenticate('google', { failureRedirect: '/#/login' }), handleLogin);
};