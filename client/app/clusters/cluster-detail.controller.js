angular.module('hive.clusters')
    .controller('ClusterDetailController', ClusterDetailController);

ClusterDetailController.$inject = ['$scope', '$mdDialog', '$mdToast', '$location', '$http', 'cluster', 'devices', 'ClusterService'];

function ClusterDetailController($scope, $mdDialog, $mdToast, $location, $http, cluster, devices, ClusterService) {
    var vm = this;

    vm.cluster = cluster;
    vm.devices = [];
    vm.totals = {
        memory: 0,
        cores: 0,
        storage: 0
    };

    vm.notify = notify;

    vm.dialog = {
        user: showUserDialog,
        link: showLinkDialog,
        device: showDeviceDialog
    };

    vm.remove = {
        cluster: removeCluster,
        device: removeDevice
    };

    // -- activate when the devices have been retrieved
    devices.$promise.then(function(devices) {
        vm.devices = devices.data;
    });

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

    function notify() {
        var token = vm.cluster.data.token;
        if (Array.isArray(token)) token = token[0];

        return $http.post(vm.cluster.data.callback, {token: token})
            .success(function() {
                return ClusterService.notifiedOfPairing(vm.cluster.id).then(function() {
                    vm.cluster.data.notified = true;

                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Device Notified!')
                            .position('top right')
                            .hideDelay(3000)
                    );
                });
            })
            .error(function(error) {
                // todo: send a toast
            }).$promise;
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
}
