angular.module('hive.clusters')
    .controller('ClusterLinkDialogController', ClusterLinkDialogController);

ClusterLinkDialogController.$inject = ['$mdDialog', 'ClusterService'];

function ClusterLinkDialogController($mdDialog, ClusterService) {
    var vm = this;

    vm.token = null;

    vm.ok = ok;

    activate();

    function activate() {
        return ClusterService.link.get().then(function(response){
            vm.token = response.link_token;
        });
    }

    function ok() {
        $mdDialog.hide();
    }
}
