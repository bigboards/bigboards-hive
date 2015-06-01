app.factory('Session', ['webStorage', function(webStorage) {
    var Session = function() {

    };

    Session.prototype.initialize = function(token) {
        webStorage.session.add('token', token);
    };

    Session.prototype.isSignedIn = function() {
        return webStorage.session.has('token');
    };

    Session.prototype.destroy = function() {
        webStorage.session.remove('token');
    };

    return new Session();
}]);

app.factory('People', ['$resource', 'settings', function($resource, settings) {
    return $resource(settings.api + '/api/v1/people/:id', { id: '@id' });
}]);

app.factory('Library', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/library/:type/:owner/:slug',
        { type: '@type', owner: '@owner', slug: '@slug' },
        {
            'search': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false}
        });
}]);