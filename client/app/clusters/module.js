var clusterModule = angular.module('hive.clusters', ['ngResource']);

clusterModule.factory('ClusterResource', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/cluster/:clusterId',
        { clusterId: '@clusterId' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'PUT', params: {type: null, owner: null, slug: null} },
            'update': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });
}]);
clusterModule.factory('ClusterDeviceResource', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/cluster/:clusterId/device/:deviceId',
        { clusterId: '@clusterId', deviceId: '@deviceId' },
        {
            list: { method: 'GET', isArray: false},
            connect: { method: 'PUT' },
            disconnect: { method: 'DELETE' }
        });
}]);

clusterModule.controller('ClusterListController', ['$scope', 'clusters', 'ClusterResource', '$mdDialog', function($scope, clusters, ClusterResource, $mdDialog) {
    $scope.clusters = [];

    clusters.$promise.then(function(clusters) {
        $scope.clusters = clusters.data;
    });

    $scope.createCluster = function(ev) {
        $mdDialog.show({
            controller: 'NewClusterDialogController',
            templateUrl: '/app/clusters/dialogs/new.part.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
        .then(function(cluster) {
            ClusterResource.add({}, cluster).$promise.then(function(newCluster) {
                $scope.clusters.push(newCluster);
            });
        }, function() {

        });
    }
}]);

clusterModule.controller('ClusterDetailController', ['$scope', 'ClusterResource', 'ClusterDeviceResource', 'DeviceResource', 'cluster', 'devices', '$location', 'Ping', function($scope, ClusterResource, ClusterDeviceResource, DeviceResource, cluster, devices, $location, Ping) {
    $scope.cluster = null;
    $scope.devices = [];

    $scope.totalMemory = 0;
    $scope.totalCores = 0;
    $scope.totalStorage = 0;

    cluster.$promise.then(function(device) {
        $scope.cluster = device;
    });

    devices.$promise.then(function(devices) {
        $scope.devices = devices.data;

        $scope.devices.forEach(function(dev) {
            Ping.ping(dev.data.ipv4, function(err, state) {
                if (err) dev.data.reachable = false;
                else dev.data.reachable = state;
            });
        });
    });

    $scope.$watch('devices', function(newValue, oldValue) {
        if (!newValue || newValue == oldValue) return;

        $scope.updateTotals();
    }, true);

    $scope.searchDevices = function(deviceName) {
        return DeviceResource.list({name: deviceName}).$promise.then(function(response) {
            return response.data;
        });
    };

    $scope.connectDevice = function(device) {
        for (var idx in $scope.devices)
            if ($scope.devices[idx].id == device.id) {
                $scope.deviceToAdd = null;
                $scope.deviceName = "";
                return;
            }

        ClusterDeviceResource.connect({clusterId: $scope.cluster.id, deviceId: device.id}).$promise.then(function(data) {
            $scope.devices.push(data);
            $scope.deviceToAdd = null;
            $scope.deviceName = "";
        }, function(err) {
            console.log(err);
        })
    };

    $scope.disconnectNode = function(node) {
        ClusterDeviceResource.disconnect({ clusterId: $scope.cluster.id, deviceId: node.id }).$promise.then(function() {
            var idx = $scope.devices.indexOf(node);
            if  (idx != -1) {
                $scope.devices.splice(idx, 1);
            }
        }, function(err) {
            console.log(err);
        });
    };

    $scope.removeDevice = function() {
        ClusterResource.remove({clusterId: $scope.cluster.id}).$promise.then(function() {
            $location.path('/clusters');
        });
    };

    $scope.updateTotals = function() {
        $scope.totalMemory = 0;
        $scope.totalCores = 0;
        $scope.totalStorage = 0;

        $scope.devices.forEach(function (node) {
            if (node.data.memory) $scope.totalMemory += parseInt(node.data.memory * 1024);
            if (node.data.cpus) {
                if ( Object.prototype.toString.call( node.data.cpus ) === '[object Array]' ) {
                    $scope.totalCores += node.data.cpus.length;
                } else {
                    $scope.totalCores += 1;
                }
            }
            if (node.data.disks) {
                node.data.disks.forEach(function(disk) {
                    if (disk.type != 'data') return;

                    $scope.totalStorage += disk.size;
                });
            }
        });
    };
}]);

clusterModule.controller('NewClusterDialogController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    $scope.step = 'create';
    $scope.cluster = {};

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.create = function() {
        $mdDialog.hide($scope.cluster);
    };
}]);

clusterModule.directive('bbDeviceItem', [function() {
    return {
        replace: true,
        scope: {
            device: '=bbDevice',
            onRemove: '&bbOnRemove'
        },
        templateUrl: 'app/clusters/cards/device-item.tmpl.html',
        controller: ['$scope', '$location', 'ClusterDeviceResource', 'Ping', function($scope, $location, ClusterDeviceResource, Ping) {
            $scope.style = {
                status: {'color': 'grey'}
            };

            $scope.status = {
                reachable: null
            };

            Ping.ping($scope.device.data.ipv4, function(err, reachable) {
                $scope.status.reachable = reachable;
                $scope.$apply();
            });

            $scope.remove = function() {
                $scope.onRemove($scope.device.data);
            };
        }]
    };
}]);

clusterModule.directive('bbClusterCard', [function() {
    return {
        scope: {
            cluster: '=bbCluster',
            onClick: '&bbOnClick'
        },
        templateUrl: 'app/clusters/cards/cluster-card.tmpl.html',
        controller: ['$scope', '$location', 'ClusterDeviceResource', function($scope, $location, ClusterDeviceResource) {
            $scope.totalMemory = 0;
            $scope.totalCores = 0;
            $scope.totalStorage = 0;

            $scope.$watch('cluster', function(value) {
                if (! value) return;

                ClusterDeviceResource.list({clusterId: $scope.cluster.id}).$promise.then(function(devices) {
                    if (devices.data) {
                        devices.data.forEach(function (node) {
                            if (node.data.memory) $scope.totalMemory += parseInt(node.data.memory * 1024);
                            if (node.data.cpus) {
                                if ( Object.prototype.toString.call( node.data.cpus ) === '[object Array]' ) {
                                    $scope.totalCores += node.data.cpus.length;
                                } else {
                                    $scope.totalCores += 1;
                                }
                            }
                            if (node.data.disks) {
                                node.data.disks.forEach(function(disk) {
                                    if (disk.type != 'data') return;

                                    $scope.totalStorage += disk.size;
                                });
                            }
                        });
                    }
                });
            });

            $scope.click = function() {
                $location.path('/clusters/' + $scope.cluster.id);
            };
        }]
    };
}]);