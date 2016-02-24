angular.module('hive.clusters')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/clusters', {
                templateUrl: 'app/cluster/cluster-list.html',
                controller: 'ClusterListController',
                controllerAs: 'vm',
                requiresLogin: true
            })
            .when('/clusters/:id', {
                templateUrl: 'app/cluster/cluster-detail.html',
                controller: 'ClusterDetailController',
                controllerAs: 'vm',
                requiresLogin: true,
                resolve: {
                    clusterId:['$route', function($route) {
                        return $route.current.params.id
                    }]
                }
            });
    }]);