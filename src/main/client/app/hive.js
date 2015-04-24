var app = angular.module( 'hive', [
    'ngRoute',
    'ngResource',
    'ngMaterial'
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

app.controller('ApplicationController', ['$scope', '$location', '$mdSidenav', function($scope, $location, $mdSidenav) {

    $scope.currentItem = null;


    $scope.toggleSidebar = function() {
        return $mdSidenav('left').toggle();
    };

    $scope.menu = [
        {
            label: 'Dashboard',
            icon: 'icon-dashboard',
            path: '/dashboard'
        },
        {
            label: 'Library',
            icon: 'fa-tint',
            path: '/library'
        },
        {
            label: 'Tasks',
            icon: 'fa-tasks',
            path: '/tasks'
        },
        //{
        //    label: 'Tutor',
        //    icon: 'fa-graduation-cap',
        //    path: '/tutors'
        //},
        {
            label: 'Docs',
            icon: 'fa-book',
            url: 'http://docs.bigboards.io'
        }

    ];

    //$scope.firmware = Firmware.get();

    $scope.$on('$routeChangeSuccess', function(event, current, previous) {
        $scope.menu.forEach(function(item) {
            if (item.path && current.$$route && current.$$route.originalPath.indexOf(item.path) == 0)
                $scope.currentItem = item;
        });
    });

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
