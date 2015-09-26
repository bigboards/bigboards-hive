angular.module('hive.dashboard.controllers', [])
    .controller('DashboardController', ['$scope', function($scope) {
    
    }]);

angular.module('hive.dashboard', ['hive.dashboard.controllers'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'app/dashboard/view.html',
                controller: 'DashboardController'
            });
    }]);