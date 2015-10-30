var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'md.data.table',
    'ngMaterial',
    'webStorageModule',
    'ui.gravatar',

    'ngClipboard',

    'auth0',
    'angular-storage',
    'angular-jwt',

    'hive.dashboard',
    'hive.designer',
    'hive.library'
]);

app.factory('settings', ['webStorage', function(webStorage) {
    return webStorage.session.get('settings');
}]);

app.config(['$routeProvider', '$sceProvider', '$mdThemingProvider', '$httpProvider', 'authProvider', 'jwtInterceptorProvider', 'ngClipProvider',
    function($routeProvider, $sceProvider, $mdThemingProvider, $httpProvider, authProvider, jwtInterceptorProvider, ngClipProvider) {
        ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");

    // Extend the red theme with a few different colors
    // Register the new color palette map with the name <code>neonRed</code>
    $mdThemingProvider.definePalette('bigboards', $mdThemingProvider.extendPalette('blue-grey', {
        '50': '008888'
    }));

    $mdThemingProvider.theme('default')
        .primaryPalette('bigboards');

    $sceProvider.enabled(false);

    authProvider.init({
        domain: 'bigboards.auth0.com',
        clientID: 'CWAxX5WLJ3kYtD33QmnO7ElppHeN6opy',
        loginUrl: '/login'
    });

    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
        return store.get('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor');

    $routeProvider
        .when('/login/callback', {
            templateUrl: 'app/login/callback.html',
            controller: 'LoginCallbackController'
        })


        .when('/login', {
            templateUrl: 'app/login/view.html',
            controller: 'LoginController'
        })
        .when('/logout', {
            templateUrl: 'app/logout/view.html',
            controller: 'LogoutController',
            requiresLogin: true
        })
        .when('/link', {
            templateUrl: 'app/link/view.html',
            controller: 'LinkController',
            requiresLogin: true
        })
        .when('/person/:username', {
            templateUrl: 'app/people/view.html',
            controller: 'PeopleViewController',
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

app.run(function($rootScope, auth, store, jwtHelper, $location) {
    auth.hookEvents();

    // This events gets triggered on refresh or URL change
    $rootScope.$on('$locationChangeStart', function() {
        var token = store.get('token');
        if (token) {
            if (!jwtHelper.isTokenExpired(token)) {
                if (!auth.isAuthenticated) {
                    auth.authenticate(store.get('profile'), token);
                }

                $rootScope.$emit('loginSuccess');
            } else {
                // Either show the login page or use the refresh token to get a new idToken
                $location.path('/login?reason=tokenExpired');
                $rootScope.$emit('logout');
            }
        }
    });

    $rootScope.$back = function() {
        window.history.back();
    }
});

app.controller('ApplicationController', ['$rootScope', '$scope', '$location', '$mdSidenav', 'auth', 'store',
    function($rootScope, $scope, $location, $mdSidenav, auth, store) {
        $scope.auth = auth;

        $scope.menuPartial = '/app/menu/partials/menu-loggedout.tmpl.html';

        $rootScope.$on('loginSuccess', function() {
            $scope.menuPartial = '/app/menu/partials/menu-loggedin.tmpl.html';
        });

        $rootScope.$on('logout', function() {
            $scope.menuPartial = '/app/menu/partials/menu-loggedout.tmpl.html';
        });

        $scope.goto = function(path) {
            $location.path(path);
        };

        $scope.login = function () {
            auth.signin({
                authParams: {
                    domain: $location.host(),
                    scope: 'openid name email roles hive_id'
                }
            }, function (profile, token) {
                // Success callback
                store.set('profile', profile);
                store.set('token', token);
                $location.path('/');

                $rootScope.$emit('loginSuccess');
            }, function (error) {
                $rootScope.$emit('loginFailure', error);
                // Error callback
            });
        };

        $scope.logout = function() {
            auth.signout();
            store.remove('profile');
            store.remove('token');

            $location.path('/');

            $rootScope.$emit('logout');
        };
}]);

app.constant('AuthUtils', {
    isOwnerOf: function(auth, item) {
        if (! auth.isAuthenticated) return false;

        var data = (item.data) ? item.data : item;

        if (data.owner)
            return data.owner == auth.profile.hive_id;
    }
});
