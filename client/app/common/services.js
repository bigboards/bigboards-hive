app.factory('Session', ['webStorage', '$http', '$q', 'Auth', '$location', function(webStorage, $http, $q, Auth, $location) {
    var Session = function() {
        this.user = null;
    };

    Session.prototype.initialize = function(token) {
        if (token) {
            webStorage.session.add('token', token);
        }

        var self = this;

        if (webStorage.session.has('user')) {
            self.user = webStorage.session.get('user');
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

    Session.prototype.amOwnerOf = function(item) {
        if (! item.data.owner) return false;
        if (! item.data.owner.username) return false;

        if (! this.isSignedIn()) return false;

        return item.data.owner.username == this.user.username;
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