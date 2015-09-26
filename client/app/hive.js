var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'ngMaterial',
    'webStorageModule',
    'ui.gravatar',

    'hive.dashboard',
    'hive.designer',
    'hive.library'
]);

app.factory('settings', ['webStorage', function(webStorage) {
    return webStorage.session.get('settings');
}]);

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
                // rejection.status
                // rejection.statusText
                // rejection.data.isError
                // rejection.data.message
                // rejection.data.name
                // rejection.data.stack

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

    $rootScope.$back = function() {
        window.history.back();
    }
}]);

app.controller('ApplicationController', ['$scope', '$location', '$mdSidenav', 'Session', function($scope, $location, $mdSidenav, Session) {
    $scope.currentItem = null;
    $scope.isLoggedIn = Session.isSignedIn;
    $scope.session = Session;
    $scope.menuPartial = (Session.isSignedIn()) ? '/app/menu/partials/menu-loggedin.tmpl.html' : '/app/menu/partials/menu-loggedout.tmpl.html';

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
