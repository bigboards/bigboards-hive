angular.module('hive.auth', ['hive.core'])
    .controller('LoginCallbackController', ['$scope', '$routeParams', '$location', 'AuthService', 'AUTH_EVENTS', '$rootScope', function($scope, $routeParams, $location, AuthService, AUTH_EVENTS, $rootScope) {
        var token = $routeParams.token;

        // -- exchange the token for the user data
        AuthService.loginWithToken(token).then(function(user) {
            $rootScope.currentUser = user;
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, user);
            $location.path('/dashboard').search('token', null);
        }, function(error) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed, error);
        });
    }])
    .service('Session', ['webStorage', function(webStorage) {
        this.create = function(id, userId, userRole) {
            this.id = id;
            this.userId = userId;
            this.userRole = userRole;
            webStorage.session.add('token', id);
        };

        this.destroy = function() {
            this.id = null;
            this.userId = null;
            this.userRole = null;
            webStorage.session.remove('token');
        };
    }])
    .factory('AuthService', ['$http', 'Session', 'USER_ROLES', 'settings', '$log', function($http, Session, USER_ROLES, settings, $log) {
        var authService = {
            loginCallbacks: [],
            logoutCallbacks: []
        };

        authService.loginWithToken = function(token) {
            return $http.get(settings.api + '/api/v1/auth/' + token).
                then(function(response) {
                    Session.create(token, response.data.id, USER_ROLES.user);

                    call(authService.loginCallbacks, response.data.data);

                    return response.data.data;
                }, function(error) {
                    throw error;
                });
        };

        authService.logout = function() {
            Session.destroy();

            call(authService.logoutCallbacks);
        };

        authService.isAuthenticated = function() {
            return !!Session.userId;
        };

        authService.isAuthorized = function(authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) authorizedRoles = [authorizedRoles];

            if (authorizedRoles.indexOf(USER_ROLES.all) != -1) return true;

            return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
        };

        authService.isOwner = function(item) {
            if (!item) return false;
            if (!item.data.owner) return false;

            return item.data.owner.id == Session.userId;
        };

        authService.whenLoggedIn = function(fn) {
            authService.loginCallbacks.push(fn);
        };

        authService.whenLoggedOut = function(fn) {
            authService.logoutCallbacks.push(fn);
        };

        function call(collection, arg) {
            collection.forEach(function(fn) {
                try {
                    fn(arg);
                } catch (error) {
                    $log.error(error.message);
                }
            });
        }

        return authService;
    }])
    .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'Session', function($rootScope, $q, AUTH_EVENTS, Session) {
        return {
            request: function(config) {
                if (Session.id) {
                    config.headers['Authorization'] = 'Bearer ' + Session.id;
                }

                return config;
            },
            responseError: function(response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);
                return $q.reject(response);
            }
        }
    }])
    .factory('AuthResolver', ['$q', '$rootScope', '$location', function($q, $rootScope, $location) {
        return {
            resolve: function() {
                var deferred = $q.defer();

                var unwatch = $rootScope.$watch('currentUser', function(currentUser) {
                    if (angular.isDefined(currentUser)) {
                        if (currentUser) {
                            deferred.resolve(currentUser);
                        } else {
                            deferred.reject();
                            $location.path('/login');
                        }
                        unwatch();
                    }
                });

                return deferred.promise;
            }
        }
    }])
    .constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })
    .constant('USER_ROLES', {
        all: '*',
        user: 'user'
    });
