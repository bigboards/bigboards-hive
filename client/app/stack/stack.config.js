angular.module('hive.stack')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/stacks', {
                templateUrl: 'app/stack/stack-list.html',
                controller: 'StackListController',
                controllerAs: 'vm'
            });

        $routeProvider
            .when('/stacks/:profile/:slug', {
                templateUrl: 'app/stack/stack-detail.html',
                controller: 'StackDetailController',
                controllerAs: 'vm',
                resolve: {
                    profileId:['$route', function($route) { return $route.current.params.profile }],
                    slug:['$route', function($route) { return $route.current.params.slug }]
                }
            });
    }]);