var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'ngMaterial',
    'webStorageModule',
    'ui.gravatar'
]);

app.constant('settings', {
    api: ''
    //api: 'http://infinite-n1:7000'
});

app.config(['$routeProvider', '$sceProvider', '$mdThemingProvider', 'gravatarServiceProvider', function($routeProvider, $sceProvider, $mdThemingProvider, gravatarServiceProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('orange');

    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('teal')
        .dark();

    $sceProvider.enabled(false);

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

                        Session.initialize($route.current.params.token);
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
        .when('/dashboard', {
            title: 'Dashboard',
            templateUrl: 'app/dashboard/view.html',
            controller: 'DashboardController'
        })
        .when('/library/:type', {
            title: 'Library',
            templateUrl: 'app/library/view.html',
            controller: 'LibraryController',
            resolve: {
                type: ['$route', function($route) {
                    return $route.current.params.type;
                }]
            }
        })
        .when('/designer', {
            templateUrl: 'app/designer/view.html',
            controller: 'DesignerController',
            resolve: {
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


    $scope.toggleSidebar = function() {
        return $mdSidenav('left').toggle();
    };

    //$scope.firmware = Firmware.get();

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
