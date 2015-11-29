var deviceModule = angular.module('hive.clusters', ['ngResource']);

deviceModule.factory('DeviceResource', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/devices/:clusterId',
        { clusterId: '@clusterId' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'PUT', params: {type: null, owner: null, slug: null} },
            'remove': { method: 'DELETE' }
        });
}]);

deviceModule.controller('DeviceListController', ['$scope', 'devices', 'DeviceResource', '$mdDialog', function($scope, devices, DeviceResource, $mdDialog) {
    $scope.devices = [];

    devices.$promise.then(function(response) {
        $scope.devices = response.data;
    });
}]);

deviceModule.directive('bbDeviceCard', [function() {
    return {
        scope: {
            device: '=bbDevice'
        },
        templateUrl: 'app/devices/cards/device-card.tmpl.html',
        controller: ['$scope', '$location', 'DeviceResource', function($scope, $location, DeviceResource) {
        }]
    };
}]);