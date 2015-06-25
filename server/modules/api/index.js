var API = require('./api');
var OAuth = require('./oauth');

module.exports.wire = function(context) {
    context.registerFactory('api', 'api', function (ctx) {
        var api =  new API(ctx.get('config'), ctx.get('auth-service'));

        var onUserLogin = function(accessToken, profileId, profileData, done) {
            return ctx.get('auth-service').login(profileId, accessToken, profileData)
                .then(function(user) {
                    return done(null, user);
                })
                .fail(function(error) {
                    return done(error, null);
                });
        };
        api.passport().use(OAuth.strategies.google(ctx.get('config'), onUserLogin));
        api.passport().use(OAuth.strategies.github(ctx.get('config'), onUserLogin));

        return api;
    });
};

module.exports.run = function(context) {
    context.get('api').listen();
};