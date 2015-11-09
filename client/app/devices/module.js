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

deviceModule.controller('DeviceDetailController', ['$scope', 'DeviceResource', 'device', '$location', function($scope, DeviceResource, device, $location) {
    $scope.device = null;

    $scope.totalMemory = 0;
    $scope.totalCores = 0;

    device.$promise.then(function(device) {
        $scope.device = device;

        if ($scope.device.data.nodes) {
            $scope.device.data.nodes.forEach(function (node) {
                if (node.memory) $scope.totalMemory += parseInt(node.memory);
                if (node.cpus) {
                    if ( Object.prototype.toString.call( node.cpus ) === '[object Array]' ) {
                        $scope.totalCores += node.cpus.length;
                    } else {
                        $scope.totalCores += 1;
                    }
                }
            });
        }
    });

    $scope.disconnectNode = function(node) {
        DeviceResource.update({deviceId: $scope.device.id}, [{ op: 'remove', fld: 'nodes', val: node }]).$promise.then(function() {
            var idx = $scope.device.data.nodes.indexOf(node);
            if  (idx != -1) {
                $scope.device.data.nodes.splice(idx, 1);
            }
        });
    };

    $scope.removeDevice = function() {
        DeviceResource.remove({deviceId: $scope.device.id}).$promise.then(function() {
            $location.path('/devices');
        });
    }
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
            $scope.totalMemory = 0;
            $scope.totalCores = 0;

            if ($scope.device.data.nodes) {
                $scope.device.data.nodes.forEach(function (node) {
                    if (node.memory) $scope.totalMemory += parseInt(node.memory);
                    if (node.cpus) {
                        if ( Object.prototype.toString.call( node.cpus ) === '[object Array]' ) {
                            $scope.totalCores += node.cpus.length;
                        } else {
                            $scope.totalCores += 1;
                        }
                    }
                });
            }

            $scope.click = function() {
                $location.path('/devices/' + $scope.device.id);
            };
        }]
    };
}]);