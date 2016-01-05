angular.module('hive.clusters')
    .directive('bbClusterDevice', ClusterDevice);

function ClusterDevice() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'app/clusters/cluster-device.directive.html',
        scope: {
            device: '=bbDevice',
            onRemove: '&bbOnRemove'
        },
        controller: ClusterDeviceController,
        controllerAs: 'vm',
        bindToController: true
    };
}

ClusterDeviceController.$inject = ['Ping'];

function ClusterDeviceController(Ping) {
    var vm = this;

    vm.reachable = false;

    vm.remove = remove;

    vm.style = {
        status: { color: 'grey' }
    };

    activate();

    function activate() {
        Ping.ping(vm.device.data.ipv4, function(err, reachable) {
            vm.reachable = reachable;
        });
    }

    function remove() {
        vm.onRemove(vm.device.data);
    }

}
