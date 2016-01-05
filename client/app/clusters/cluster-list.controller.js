angular.module('hive.clusters')
    .controller('ClusterListController', ClusterListController);

ClusterListController.$inject = ['auth', '$mdDialog', '$location', 'clusters', 'ClusterService'];

function ClusterListController(auth, $mdDialog, $location, clusters, ClusterService) {
    var vm = this;

    vm.loading = true;
    vm.isLoggedIn = auth.isAuthenticated;
    vm.items = [];

    vm.showCreateClusterDialog = showCreateClusterDialog;
    vm.showDetail = showDetail;

    clusters.$promise.then(function(clusters) {
        vm.items = clusters.data;
        vm.loading = false;
    });

    function showDetail(cluster) {
        $location.path('/clusters/' + cluster.id);
    }

    function showCreateClusterDialog(ev) {
        $mdDialog.show({
            controller: 'ClusterDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/clusters/cluster.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        }).then(function(cluster) {
            return ClusterService.create(cluster)
                .then(function(newCluster) {
                    vm.items.push(newCluster);
                });
        });
    }
}
