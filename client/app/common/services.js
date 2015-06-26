app.factory('Session', ['webStorage', '$http', '$q', 'Auth', '$location', function(webStorage, $http, $q, Auth, $location) {
    var Session = function() {
        this.user = null;
    };

    Session.prototype.initialize = function(token) {
        if (token) {
            webStorage.session.add('token', token);
        }

        var self = this;

        if (webStorage.session.has('token')) {
            Auth.get({token: webStorage.session.get('token')}).$promise
                .then(function (response) {
                    if (response.isError && response.name == 'NotFoundError') {
                        // -- remove the token from the web storage
                        webStorage.session.remove('token');

                        // -- redirect to the login page
                        $location.path('/login?reason=InvalidToken');
                    } else {
                        self.user = response.data;
                    }
                });
        }
    };

    Session.prototype.updateUser = function(user) {
        this.user = user;
    };

    Session.prototype.isSignedIn = function() {
        return webStorage.session.has('token');
    };

    Session.prototype.token = function() {
        return webStorage.session.get('token');
    };

    Session.prototype.destroy = function() {
        var self = this;
        
        Auth.logout({token: webStorage.session.get('token')});
        self.user = null;
        webStorage.session.remove('token');
    };

    Session.prototype.currentUser = function() {
        var self = this;

        if (this.user) return $q(function(resolve, reject) { resolve(self.user); });

        if (webStorage.session.has('token')) {
            return Auth.get({token: webStorage.session.get('token')}).$promise.then(function (user) {
                self.user = user.data;
                return user.data;
            });
        } else {
            return $q(function(resolve, reject) { resolve(null); });
        }
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

app.factory('Library', ['$resource', 'Session', 'settings', function($resource, Session, settings) {
    return $resource(
        settings.api + '/api/v1/library/:type/:owner/:slug',
        { type: '@type', owner: '@owner', slug: '@slug' },
        {
            'search': { method: 'GET', isArray: false, params: { type: null, owner: null, slug: null } },
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