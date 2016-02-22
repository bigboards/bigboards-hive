angular.module('hive.clusters')
    .controller('ClusterListController', ClusterListController);

ClusterListController.$inject = ['auth', '$mdDialog', '$location', 'ClusterService'];

function ClusterListController(auth, $mdDialog, $location, ClusterService) {
    var vm = this;

    vm.loading = true;
    vm.isLoggedIn = auth.isAuthenticated;
    vm.items = [];

    vm.showCreateClusterDialog = showCreateClusterDialog;
    vm.showDetail = showDetail;

    ClusterService.list().then(function(results) {
        vm.items = results.hits;
        vm.loading = false;
    });

    function showDetail(cluster) {
        $location.path('/clusters/' + cluster.id);
    }

    function showCreateClusterDialog(ev) {
        $mdDialog.show({
            controller: 'ClusterDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/cluster/cluster.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        }).then(function(cluster) {
            return ClusterService.create(cluster.id, cluster)
                .then(function(newCluster) {
                    vm.items.push(newCluster);
                });
        });
    }
}
