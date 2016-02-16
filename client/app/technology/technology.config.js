angular.module('hive.technology').config(config);

config.$inject = ['$routeProvider'];

function config($routeProvider) {
    $routeProvider
        .when('/technologies', {
            templateUrl: 'app/technology/list.html',
            controller: 'ListController',
            controllerAs: 'vm'
        })
        .when('/technologies/:id', {
            templateUrl: 'app/technology/technology.html',
            controller: 'TechnologyController',
            controllerAs: 'vm'
        })
        .when('/technologies/:technology/:version', {
            templateUrl: 'app/technology/version.html',
            controller: 'VersionController',
            controllerAs: 'vm'
        })
        .when('/technologies/:technology/:version/:service', {
            templateUrl: 'app/technology/service.html',
            controller: 'ServiceController',
            controllerAs: 'vm'
        })
        .when('/technologies/:technology/:version/:service/:daemon', {
            templateUrl: 'app/technology/daemon.html',
            controller: 'DaemonController',
            controllerAs: 'vm'
        })
}