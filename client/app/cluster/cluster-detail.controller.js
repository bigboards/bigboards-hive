angular.module('hive.clusters')
    .controller('ClusterDetailController', ClusterDetailController);

ClusterDetailController.$inject = ['$scope', '$mdDialog', '$location', 'cluster', 'devices', 'tints', 'ClusterService'];

function ClusterDetailController($scope, $mdDialog, $location, cluster, devices, tints, ClusterService) {
    var vm = this;

    vm.cluster = cluster;
    vm.devices = [];
    vm.tints = tints;
    vm.totals = {
        memory: 0,
        cores: 0,
        storage: 0
    };

    vm.dialog = {
        user: showUserDialog,
        link: showLinkDialog,
        device: showDeviceDialog
    };

    vm.remove = {
        cluster: removeCluster,
        device: removeDevice,
        tint: removeTint
    };

    // -- activate when the devices have been retrieved
    devices.$promise.then(function(devices) {
        vm.devices = devices.data;

        activate();
    });

    function activate() {
        recalculate();

        $scope.$watch('vm.devices', function(newValue, oldValue) {
            if (!newValue || newValue == oldValue) return;

            recalculate();
        }, true);
    }

    function showUserDialog(ev) {
        $mdDialog.show({
            controller: 'ClusterUserDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/clusters/cluster-user.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                cluster: vm.cluster
            }
        });
    }

    function showLinkDialog(ev) {
        $mdDialog.show({
            controller: 'ClusterLinkDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/clusters/cluster-link.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                cluster: vm.cluster
            }
        });
    }

    function showDeviceDialog(ev) {
        $mdDialog.show({
            controller: 'ClusterDeviceDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/clusters/cluster-device.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                cluster: vm.cluster
            }
        }).then(function(device) {
            return ClusterService.devices.add(vm.cluster.id, device.id).then(function(response) {
                if (response.error) return;

                vm.devices.push(response);
            });
        });
    }

    function recalculate() {
        vm.totals = {
            memory: 0,
            cores: 0,
            storage: 0
        };

        vm.devices.forEach(function (node) {
            if (node.data.memory) vm.totals.memory += parseInt(node.data.memory * 1024);
            if (node.data.cpus) {
                if ( Object.prototype.toString.call( node.data.cpus ) === '[object Array]' ) {
                    vm.totals.cores += node.data.cpus.length;
                } else {
                    vm.totals.cores += 1;
                }
            }
            if (node.data.disks) {
                if ( Object.prototype.toString.call( node.data.disks ) === '[object Array]' ) {
                    node.data.disks.forEach(function(disk) {
                        vm.totals.storage += (disk.size * 1024);
                    });
                } else {
                    vm.totals.storage += (node.data.disks.size * 1024) ;
                }
            }
        });
    }

    function removeCluster() {
        return ClusterService.remove(vm.cluster.id).then(function() {
            $location.path('/clusters');
        });
    }

    function removeDevice(node) {
        return ClusterService.devices.remove(vm.cluster.id, node.id).then(function() {
            var idx = vm.devices.indexOf(node);
            if  (idx != -1) {
                vm.devices.splice(idx, 1);
            }
        });
    }

    function removeTint(tint) {
        return ClusterService.tints.uninstall(vm.cluster.id, tint).then(function() {
            var idx = vm.tints.data.indexOf(tint);
            if  (idx != -1) {
                vm.tints.data.splice(idx, 1);
            }
        });
    }
}
