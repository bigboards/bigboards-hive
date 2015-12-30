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
                    tint: ['$route', 'LibraryService', function($route, LibraryService) {
                        return LibraryService.get($route.current.params.type, $route.current.params.owner, $route.current.params.slug);
                    }]
                }
            })
    }]);
