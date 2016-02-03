angular.module('hive.library')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/library', {
                title: 'Library',
                templateUrl: 'app/library/view.html',
                controller: 'LibraryController',
                controllerAs: 'vm'
            })
            .when('/library/:type/:owner/:slug', {
                title: 'Library',
                templateUrl: 'app/library/detail.html',
                controller: 'LibraryDetailController',
                controllerAs: 'vm',
                resolve: {
                    tint: TintResolver,
                    clusters: ClustersResolver
                }
            })
            .when('/library/:type/:owner/:slug/deploy/:clusterId', {
                title: 'Library',
                templateUrl: 'app/library/deploy.html',
                controller: 'LibraryDeployController',
                controllerAs: 'vm',
                resolve: {
                    tint: TintResolver,
                    cluster: ClusterResolver,
                    nodes: ClusterNodesResolver,
                    model: DeployModelResolver
                }
            })
    }]);

DeployModelResolver.$inject = ['$q', '$route', 'TintService', 'ClusterService'];
function DeployModelResolver($q, $route, LibraryService, ClusterService) {
    return $q.all([
        ClusterService.devices.list($route.current.params.clusterId),
        LibraryService.get($route.current.params.type, $route.current.params.owner, $route.current.params.slug).$promise
    ]).then(function(results) {
        var selections = {};

        results[1].data.stack.groups.forEach(function(group) {
            selections[group.name] = {
                maxInstances: parseMaxInstanceCount(results[0].data.length, group.max_instance_count),
                instances: []
            }
        });

        return selections;
    });
}

TintResolver.$inject = ['$route', 'TintService'];
function TintResolver($route, LibraryService) {
    return LibraryService.get($route.current.params.type, $route.current.params.owner, $route.current.params.slug);
}

ClusterResolver.$inject = ['$route', 'ClusterService'];
function ClusterResolver($route, ClusterService) {
    return ClusterService.get($route.current.params.clusterId);
}

ClusterNodesResolver.$inject = ['$route', 'ClusterService'];
function ClusterNodesResolver($route, ClusterService) {
    return ClusterService.devices.list($route.current.params.clusterId);
}

ClustersResolver.$inject = ['ClusterService'];
function ClustersResolver(ClusterService) {
    return ClusterService.list();
}

function parseMaxInstanceCount(nodeCount, maxInstanceCount) {
    if (maxInstanceCount == null || maxInstanceCount == 0) return 0;
    if (maxInstanceCount >= 1) return maxInstanceCount;
    else {
        return Math.ceil(nodeCount * maxInstanceCount);
    }
}