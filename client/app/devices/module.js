var deviceModule = angular.module('hive.devices', ['ngResource']);

deviceModule.factory('DeviceResource', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/devices/:deviceId',
        { deviceId: '@deviceId' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'PUT', params: {type: null, owner: null, slug: null} },
            'update': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });
}]);

deviceModule.controller('DeviceListController', ['$scope', 'DeviceResource', function($scope, DeviceResource) {
    $scope.devices = [];

    DeviceResource.list().$promise.then(function(devices) {
        $scope.devices = devices.data;
    });
}]);

deviceModule.controller('DeviceDetailController', ['$scope', 'DeviceResource', 'device', function($scope, DeviceResource, device) {
    $scope.device = null;

    device.$promise.then(function(device) {
        $scope.device = device;
    });
}]);

deviceModule.controller('NewDeviceController', ['$scope', 'DeviceResource', function($scope, DeviceResource) {
    $scope.step = 'create';
    $scope.deviceId = null;
    $scope.device = {};

    $scope.stepUrl = function () {
        return '/app/devices/steps/' + $scope.step + '.part.html';
    };

    $scope.createDevice = function() {
        DeviceResource.add({}, $scope.device).$promise.then(function(device) {
            $scope.device = device.data;
            $scope.deviceId = device.id;

            $scope.step = 'code';
        });
    }

}]);

deviceModule.directive('bbDeviceCard', [function() {
    return {
        scope: {
            device: '=bbDevice',
            onClick: '&bbOnClick'
        },
        templateUrl: 'app/devices/cards/device-card.tmpl.html',
        controller: ['$scope', '$location', function($scope, $location) {
            $scope.click = function() {
                $location.path('/devices/' + $scope.device.id);
            };
        }]
    };
}]);