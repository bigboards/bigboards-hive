angular.module('hive.clusters')
    .directive('bbClusterTint', ClusterTint);

function ClusterTint() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'app/clusters/cluster-tint.directive.html',
        scope: {
            tint: '=bbTint',
            onRemove: '&bbOnRemove'
        },
        controller: ClusterTintController,
        controllerAs: 'vm',
        bindToController: true
    };
}

ClusterTintController.$inject = [];

function ClusterTintController() {
    var vm = this;

    vm.reachable = false;

    vm.remove = remove;

    vm.style = {
        status: { color: 'grey' }
    };

    function remove() {
        vm.onRemove(vm.tint);
    }

}
