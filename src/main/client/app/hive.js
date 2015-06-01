var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'ngMaterial',
    'webStorageModule'
]);

app.constant('settings', {
    api: ''
    //api: 'http://infinite-n1:7000'
});

app.config(['$routeProvider', '$sceProvider', '$mdThemingProvider', function($routeProvider, $sceProvider, $mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('orange');

    $sceProvider.enabled(false);

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
        .otherwise({
            redirectTo: '/dashboard'
        });
}]);

app.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
        }
    });
}]);

app.controller('ApplicationController', ['$scope', '$location', '$mdSidenav', 'Session', function($scope, $location, $mdSidenav, Session) {

    $scope.currentItem = null;
    $scope.isLoggedIn = Session.isSignedIn;


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
