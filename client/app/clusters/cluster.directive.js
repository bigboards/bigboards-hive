angular.module('hive.clusters')
    .directive('bbCluster', Cluster);

function Cluster() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'app/clusters/cluster.directive.html',
        scope: {
            cluster: '=bbModel',
            onClick: '&bbOnClick'
        },
        controller: ClusterController,
        controllerAs: 'vm',
        bindToController: true
    };
}

ClusterController.$inject = [];

function ClusterController() {
    var vm = this;

    vm.click = click;

    function click() {
        vm.onClick(vm.cluster);
    }
}
