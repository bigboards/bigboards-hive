var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'ngMaterial',
    'webStorageModule',
    'ui.gravatar',

    'hive.core',
    'hive.auth',

    'hive.dashboard',
    'hive.designer',
    'hive.library'
]);

app.factory('settings', ['webStorage', function(webStorage) {
    return webStorage.session.get('settings');
}]);

app.config(['$routeProvider', '$sceProvider', '$mdThemingProvider', '$httpProvider', 'gravatarServiceProvider', 'USER_ROLES', function($routeProvider, $sceProvider, $mdThemingProvider, $httpProvider, gravatarServiceProvider, USER_ROLES) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('teal');

    $sceProvider.enabled(false);

    $httpProvider.interceptors.push(['$injector', function($injector) {
        return $injector.get('AuthInterceptor');
    }]);

    gravatarServiceProvider.defaults = {
        size     : 100,
        "default": 'mm'  // Mystery man as default for missing avatars
    };

    $routeProvider
        .when('/login/callback', {
            templateUrl: 'app/login/callback.html',
            controller: 'LoginCallbackController',
            data: {
                authorizedRoles: [ USER_ROLES.all ]
            }
        })


        .when('/login', {
            templateUrl: 'app/login/view.html',
            controller: 'LoginController',
            data: {
                authorizedRoles: [ USER_ROLES.all ]
            }
        })
        .when('/logout', {
            templateUrl: 'app/logout/view.html',
            controller: 'LogoutController',
            data: {
                authorizedRoles: [ USER_ROLES.all ]
            }
        })
        .when('/settings', {
            templateUrl: 'app/settings/view.html',
            controller: 'SettingsController',
            data: {
                authorizedRoles: [ USER_ROLES.user ]
            },
            resolve: {
                auth: ['AuthResolver', function(AuthResolver) {
                    return AuthResolver.resolve();
                }]
            }
        })
        .when('/person/:username', {
            templateUrl: 'app/people/view.html',
            controller: 'PeopleViewController',
            data: {
                authorizedRoles: [ USER_ROLES.all ]
            },
            resolve: {
                person: ['$route', 'People', function($route, People) {
                    return People.get({username: $route.current.params.username});
                }],
                context: ['$route', 'People', function($route, People) {
                    var context = {
                        mode: 'view'
                    };

                    if ($route.current.params.action) {
                        context.mode = $route.current.params.action;
                    }

                    return context;
                }]
            }
        })
        .when('/test', {
            templateUrl: 'app/test/view.html',
            controller: 'TestController'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}]);

app.run(['$rootScope', 'AUTH_EVENTS', 'settings', '$location', '$log', 'AuthService', 'AuthResolver', 'webStorage', function($rootScope, AUTH_EVENTS, settings, $location, $log, AuthService, AuthResolver, webStorage) {
    // -- reconstruct the user state
    var token = webStorage.session.get('token');
    if (token) {
        AuthService.loginWithToken(token).then(function(user) {
            $rootScope.currentUser = user;
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, user);
        }, function(error) {
            if (error.status == 404) $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout, error);
            else $rootScope.$broadcast(AUTH_EVENTS.loginFailed, error);
        });
    }

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login'];

    // check if current location matches route
    var bypassedRoute = function (route) {
        return _.find(routesThatDontRequireAuth,
            function (noAuthRoute) {
                return route.indexOf(noAuthRoute) == 0;
            });
    };


    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        var verify = function() {
            var authorizedRoles = next.$$route.data.authorizedRoles;

            if (!AuthService.isAuthorized(authorizedRoles)) {
                event.preventDefault();

                if (AuthService.isAuthenticated()) {
                    // -- user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // -- user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        };


        //if (!current || !current.$$route || !current.$$route.resolve) return;

        if (! bypassedRoute($location.url()) && next.$$route) {
            if (! next.$$route.data) {
                $log.warn('no authorizedRoles have been declared on the current route!');
            }

            if (! $rootScope.currentUser) {
                return AuthResolver.resolve().then(function() {
                    verify();
                })
            } else {
                verify();
            }
        }
    });

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        $log.info('Received ' + event.name);
        $location.path('/login').search('reason', event.name);
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function(event) {
        $log.info('Received ' + event.name);
        AuthService.logout();
        $location.path('/login').search('reason', event.name);
    });

    $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {
        $log.info('Received ' + event.name);
        // todo: show a message
    });

    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event) {
        $log.info('Received ' + event.name);
        $location.path('/dashboard');
    });

    $rootScope.$back = function() {
        window.history.back();
    }
}]);

app.controller('ApplicationController', ['$scope', '$location', '$mdSidenav', 'AuthService', 'USER_ROLES', 'AUTH_EVENTS', function($scope, $location, $mdSidenav, AuthService, USER_ROLES, AUTH_EVENTS) {
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;

    //$scope.isLoggedIn = Session.isSignedIn;
    $scope.menuPartial = '/app/menu/partials/menu-loggedout.tmpl.html';


    $scope.$on(AUTH_EVENTS.logoutSuccess, function() {
        $scope.menuPartial = '/app/menu/partials/menu-loggedout.tmpl.html';
    });

    $scope.$on(AUTH_EVENTS.loginSuccess, function() {
        $scope.menuPartial = '/app/menu/partials/menu-loggedin.tmpl.html';
    });

    //$scope.toggleSidebar = function() {
    //    return $mdSidenav('left').toggle();
    //};

    //$scope.firmware = Firmware.get();

    $scope.goto = function(path) {
        $location.path(path);
    };

    //$scope.invokeMenuItem = function(item) {
    //    if (item.handler) {
    //        item.handler($scope);
    //    } else if (item.path) {
    //        $location.path(item.path);
    //        $scope.$emit('navigate', item);
    //    } else if (item.url) {
    //        console.log('goto ' + item.url);
    //        window.open(item.url,'_blank');
    //    }
    //};
}]);
