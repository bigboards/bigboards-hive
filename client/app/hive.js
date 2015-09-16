var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'ngMaterial',
    'webStorageModule',
    'ui.gravatar'
]);

app.factory('settings', ['webStorage', function(webStorage) {
    return webStorage.session.get('settings');
}]);

app.constant('Firmwares', [
    { codename: 'genesis', version: '0.5.0'},
    { codename: 'feniks', version: '1.0.0'},
    { codename: 'ember', version: '1.1.0'},
    { codename: 'gemini', version: '1.2.0'}
]);

app.constant('Architectures', [
    'all',
    'x86_64',
    'armv7l'
]);

app.config(['$routeProvider', '$sceProvider', '$mdThemingProvider', '$httpProvider', 'gravatarServiceProvider', function($routeProvider, $sceProvider, $mdThemingProvider, $httpProvider, gravatarServiceProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('teal');

    $sceProvider.enabled(false);

    $httpProvider.interceptors.push(function($q, $location, webStorage) {
        return {
            'request': function(config) {
                if (webStorage.session.has('token')) {
                    config.headers['Authorization'] = 'Bearer ' + webStorage.session.get('token');
                }

                return config;
            },

            'responseError': function(rejection) {
                // -- redirect to the login page
                $location.path('/login?msg=' + rejection);

                return rejection;
            }
        };
    });

    gravatarServiceProvider.defaults = {
        size     : 100,
        "default": 'mm'  // Mystery man as default for missing avatars
    };

    $routeProvider
        .when('/login', {
            templateUrl: 'app/login/view.html',
            controller: 'LoginController',
            resolve: {
                context: ['$route', 'Session', function($route, Session) {
                    var context = {
                        mode: 'login'
                    };

                    if ($route.current.params.token) {
                        context.mode = 'validate';
                        context.token = $route.current.params.token;

                        //Session.initialize($route.current.params.token);
                    } else if ($route.current.params.error) {
                        context.mode = 'error';
                        context.error = $route.current.params.error;
                    } else if ($route.current.params.bye) {
                        Session.destroy();
                    }

                    return context;
                }]
            }
        })
        .when('logout', {
            templateUrl: 'app/login/view.html',
            controller: 'LoginController',
            resolve: {
                context: ['$route', 'Session', function($route, Session) {
                    var context = {
                        mode: 'login'
                    };

                    Session.destroy();

                    return context;
                }]
            }
        })
        .when('/dashboard', {
            title: 'Dashboard',
            templateUrl: 'app/dashboard/view.html',
            controller: 'DashboardController'
        })
        .when('/library', {
            title: 'Library',
            templateUrl: 'app/library/view.html',
            controller: 'LibraryController'
        })
        .when('/designer', {
            templateUrl: 'app/designer/view.html',
            controller: 'DesignerController',
            resolve: {
            }
        })
        .when('/designer/:type/:owner/:slug', {
            templateUrl: 'app/designer/design.html',
            controller: 'InternalDesignController',
            resolve: {
                tint: ['$route', 'Library', function($route, Library) {
                    return Library.get({type: $route.current.params.type, owner: $route.current.params.owner, slug: $route.current.params.slug});
                }]
            }
        })

        .when('/library/:type/:owner/:slug', {
            title: 'Library',
            templateUrl: 'app/library/detail.html',
            controller: 'LibraryDetailController',
            resolve: {
                tint: ['$route', 'Library', function($route, Library) {
                    return Library.get({type: $route.current.params.type, owner: $route.current.params.owner, slug: $route.current.params.slug});
                }]
            }
        })
        .when('/settings', {
            templateUrl: 'app/settings/view.html',
            controller: 'SettingsController',
            resolve: {
            }
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

app.run(['$rootScope', 'Session', function($rootScope, Session) {
    // -- load the user if needed
    Session.initialize();

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {

    });
}]);

app.controller('ApplicationController', ['$scope', '$location', '$mdSidenav', 'Session', function($scope, $location, $mdSidenav, Session) {
    $scope.currentItem = null;
    $scope.isLoggedIn = Session.isSignedIn;
    $scope.session = Session;
    $scope.menuPartial = ($scope.isLoggedIn()) ? '/app/menu/partials/menu-loggedin.tmpl.html' : '/app/menu/partials/menu-loggedout.tmpl.html';

    $scope.toggleSidebar = function() {
        return $mdSidenav('left').toggle();
    };

    //$scope.firmware = Firmware.get();

    $scope.goto = function(path) {
        $location.path(path);
    };

    $scope.invokeMenuItem = function(item) {
        if (item.handler) {
            item.handler($scope);
        } else if (item.path) {
            $location.path(item.path);
            $scope.$emit('navigate', item);
        } else if (item.url) {
            console.log('goto ' + item.url);
            window.open(item.url,'_blank');
        }
    };
}]);
