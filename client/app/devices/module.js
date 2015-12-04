var deviceModule = angular.module('hive.devices', ['ngResource']);

deviceModule.factory('DeviceResource', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/devices/:clusterId',
        { clusterId: '@clusterId' },
        {
            'list': { method: 'GET', isArray: false},
            'filter': { method: 'GET', isArray: false, params: {clusterId: 'filter'}},
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
            $scope.totalMemory = 0;
            $scope.totalCores = 0;
            $scope.totalStorage = 0;

            $scope.$watch('device', function(value) {
                if (! value) return;

                if (value.data.memory) $scope.totalMemory += parseInt(value.data.memory * 1024);
                if (value.data.cpus) {
                    if ( Object.prototype.toString.call( value.data.cpus ) === '[object Array]' ) {
                        $scope.totalCores += value.data.cpus.length;
                    } else {
                        $scope.totalCores += 1;
                    }
                }
                if (value.data.disks) {
                    if ( Object.prototype.toString.call( value.data.disks ) === '[object Array]' ) {
                        value.data.disks.forEach(function(disk) {
                            if (disk.type != 'data') return;

                            $scope.totalStorage += (disk.size * 1024);
                        });
                    } else {
                        $scope.totalStorage += (value.data.disks.type != 'data') ? 0 : (value.data.disks.size * 1024) ;
                    }
                }
            });
        }]
    };
}]);