var API = require('./api');
var OAuth = require('./oauth');

module.exports.wire = function(context) {
    context.registerFactory('api', 'api', function (ctx) {
        return new API(ctx.get('config'), ctx.get('auth-service'));
    });
};

module.exports.run = function(context) {
    context.get('api').listen();
};