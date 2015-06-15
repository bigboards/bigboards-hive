app.factory('Session', ['webStorage', '$http', '$q', 'Auth', function(webStorage, $http, $q, Auth) {
    var Session = function() {
        this.user = null;

        var self = this;
        if (webStorage.session.has('token')) {
            Auth.get({token: webStorage.session.get('token')}).$promise.then(function (user) {
                self.user = user.data;
            });
        }
    };

    Session.prototype.initialize = function(token) {
        if (token) {
            webStorage.session.add('token', token);
        }

        var self = this;

        Auth.get({token: webStorage.session.get('token')}).$promise.then(function(user) {
            self.user = user.data;
        });
    };

    Session.prototype.updateUser = function(user) {
        this.user = user;
    };

    Session.prototype.isSignedIn = function() {
        return webStorage.session.has('token');
    };

    Session.prototype.destroy = function() {
        var self = this;
        
        Auth.logout({token: webStorage.session.get('token')});
        self.user = null;
        webStorage.session.remove('token');
    };

    return new Session();
}]);

app.factory('People', ['$resource', 'settings', function($resource, settings) {
    return $resource(settings.api + '/api/v1/people/:username', { username: '@username' },
        {
            'save': { method: 'PUT'}
        }
    );
}]);

app.factory('Library', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/library/:type/:owner/:slug',
        { type: '@type', owner: '@owner', slug: '@slug' },
        {
            'search': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'POST', params: {type: null, owner: null, slug: null} },
            'update': { method: 'POST' },
            'remove': { method: 'DELETE' }
        });
}]);

app.factory('Auth', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/auth/:token',
        { token: '@token'},
        {
            'logout': { method: 'DELETE', isArray: false},
            'get': { method: 'GET', isArray: false}
        });
}]);