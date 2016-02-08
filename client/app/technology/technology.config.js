angular.module('hive.technology').config(config);

config.$inject = ['$routeProvider'];

function config($routeProvider) {
    $routeProvider
        .when('/technologies', {
            templateUrl: 'app/technology/list.html',
            controller: 'TechnologyListController',
            controllerAs: 'vm'
        })
        .when('/technologies/:id', {
            templateUrl: 'app/technology/detail.html',
            controller: 'TechnologyDetailController',
            controllerAs: 'vm',
            resolve: {
                technology: TechnologyResolver,
                versions: TechnologyVersionsResolver
            }
        })
}


TechnologyResolver.$inject = ['$route', 'TechnologyService'];
function TechnologyResolver($route, TechnologyService) {
    return TechnologyService.get($route.current.params.id);
}

TechnologyVersionsResolver.$inject = ['$route', 'TechnologyService'];
function TechnologyVersionsResolver($route, TechnologyService) {
    return TechnologyService.versions.list($route.current.params.id);
}