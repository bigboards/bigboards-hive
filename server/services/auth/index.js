var API = require('../../utils/api-utils');

module.exports = {
    Service: require('./service'),
    Resource: require('./resource'),
    io: function(socket, services) {},
    link: function(app, services, passport) {
        var resource = new this.Resource(services.auth);

        API.registerGet(app, '/api/v1/auth/:token', function(req, res) { return resource.get(req, res); });
        API.registerDelete(app, '/api/v1/auth/:token', function(req, res) { return resource.remove(req, res); });

        app.get('/auth/github', passport.authenticate('github'));
        app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
        app.get('/auth/bitbucket', passport.authenticate('bitbucket'));

        app.get('/auth/github/callback',
            passport.authenticate('github', { failureRedirect: '/#/login' }),
            function(req, res) {
                res.redirect('/#/login?token=' + req.user.token);
            });

        app.get('/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/#/login' }),
            function(req, res) {
                res.redirect('/#/login?token=' + req.user.token);
            });

        app.get('/auth/bitbucket/callback',
            passport.authenticate('bitbucket', { failureRedirect: '/#/login' }),
            function(req, res) { res.redirect('/#/login?token=' + req.user.token); });
    }
};