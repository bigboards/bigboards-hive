angular.module('hive.clusters')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/clusters', {
                templateUrl: 'app/cluster/cluster-list.html',
                controller: 'ClusterListController',
                controllerAs: 'vm',
                requiresLogin: true
            })
            .when('/clusters/:clusterId', {
                templateUrl: 'app/cluster/cluster-detail.html',
                controller: 'ClusterDetailController',
                controllerAs: 'vm',
                requiresLogin: true,
                resolve: {
                    cluster: ClusterResolver,
                    devices: ClusterDevicesResolver,
                    tints: InstalledTintResolver
                }
            });
    }]);

ClusterResolver.$inject = ['$route', 'ClusterService'];
function ClusterResolver($route, ClusterService) {
    return ClusterService.get($route.current.params.clusterId);
}

ClusterDevicesResolver.$inject = ['$route', 'ClusterService'];
function ClusterDevicesResolver($route, ClusterService) {
    return ClusterService.devices.list($route.current.params.clusterId);
}

InstalledTintResolver.$inject = ['$route', 'ClusterService'];
function InstalledTintResolver($route, ClusterService) {
    return ClusterService.tints.list($route.current.params.clusterId);
}