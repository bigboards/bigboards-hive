angular.module('hive.node')
    .directive('bbNodeDirective', NodeDirective);

function NodeDirective() {
    return {
        scope: {
            node: '=bbNode'
        },
        templateUrl: 'app/node/node-card.directive.html',
        controller: NodeDirectiveController,
        controllerAs: 'vm',
        bindToController: true
    };
}

NodeDirectiveController.$inject = ['$scope'];

function NodeDirectiveController($scope) {
    var vm = this;
    vm.totalMemory = 0;
    vm.totalCores = 0;
    vm.totalStorage = 0;

    $scope.$watch('node', function(value) {
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
}