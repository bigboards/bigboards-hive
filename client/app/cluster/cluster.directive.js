angular.module('hive.clusters')
    .directive('bbClusterCard', Cluster);

function Cluster() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'app/cluster/cluster.directive.html',
        scope: {
            cluster: '=bbModel',
            onClick: '&bbOnClick'
        },
        controller: ClusterController,
        controllerAs: 'vm',
        bindToController: true
    };
}

ClusterController.$inject = ['ClusterService', '$scope'];

function ClusterController(ClusterService, $scope) {
    var vm = this;

    vm.totals = {
        memory: 0,
        cores: 0,
        storage: 0
    };

    vm.loading = true;
    vm.click = click;

    activate();

    function activate() {
        $scope.$watch('vm.cluster', function(value) {
            if (! value) return;

            vm.loading = true;
            recalculate().then(function() {
                vm.loading = false;
            })
        });
    }

    function click() {
        vm.onClick(vm.cluster);
    }

    function recalculate() {
        return ClusterService.nodes.list(vm.cluster.data.name).then(function(devices) {
            if (! devices.data) return;

            devices.data.forEach(function (node) {
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
        });
    }
}
