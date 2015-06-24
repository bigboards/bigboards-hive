function AuthLinker(api, resource) {
    this.api = api;
    this.resource = resource;
}

AuthLinker.prototype.link = function(api, resource) {
    var handleLogin = function(req, res) {
        res.redirect('/#/login?token=' + req.user.token);
    };

    api.registerGet('/api/v1/auth/:token', function(req, res) { return resource.get(req, res); });
    api.registerDelete('/api/v1/auth/:token', function(req, res) { return resource.remove(req, res); });

    api.registerGet('/auth/github', api.passport().authenticate('github'));
    api.registerSecureGet('/auth/github/callback', api.passport().authenticate('github', { failureRedirect: '/#/login' }), handleLogin);

    api.registerGet('/auth/google', api.passport().authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
    api.registerSecureGet('/auth/google/callback', api.passport().authenticate('google', { failureRedirect: '/#/login' }), handleLogin());
};

module.exports = AuthLinker;
