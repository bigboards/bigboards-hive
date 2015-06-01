var API = require('../../utils/api-utils');

module.exports = {
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services, passport) {
        app.get('/auth/logout', function(req, res) {
            services.Auth.logout(req.token);
            res.redirect('/#/auth?token=' + req.token);
        });

        app.get('/auth/github', passport.authenticate('github'));
        app.get('/auth/bitbucket', passport.authenticate('bitbucket'));

        app.get('/auth/github/callback',
            passport.authenticate('github', { failureRedirect: '/#/login' }),
            function(req, res) {
                res.redirect('/#/login?token=' + req.user.token);
            });

        app.get('/auth/bitbucket/callback',
            passport.authenticate('bitbucket', { failureRedirect: '/#/login' }),
            function(req, res) { res.redirect('/#/login?token=' + req.user.token); });
    }
};