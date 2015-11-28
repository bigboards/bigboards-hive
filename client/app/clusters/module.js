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

clusterModule.controller('ClusterDetailController', ['$scope', 'ClusterResource', 'ClusterDeviceResource', 'cluster', 'devices', '$location', function($scope, ClusterResource, ClusterDeviceResource, cluster, devices, $location) {
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
    });

    $scope.$watch('devices', function() {
        $scope.updateTotals();
    }, true);

    $scope.connectDevice = function(deviceCode) {
        ClusterDeviceResource.connect({clusterId: $scope.cluster.id, deviceId: deviceCode}).$promise.then(function(data) {
            $scope.devices.push(data);
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
    }

    $scope.updateTotals = function() {
        if (! $scope.devices || $scope.devices.length == 0) {
            $scope.totalMemory = 0;
            $scope.totalCores = 0;
            $scope.totalStorage = 0;

            return;
        }

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