angular.module('hive.node')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/nodes', {
                templateUrl: 'app/node/node-list.html',
                controller: 'NodeListController',
                controllerAs: 'vm',
                requiresLogin: true
            });
    }]);