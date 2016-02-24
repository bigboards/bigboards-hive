angular.module('hive.clusters')
    .controller('ClusterDialogController', ClusterDialogController);

ClusterDialogController.$inject = ['$mdDialog', 'auth'];

function ClusterDialogController($mdDialog, auth) {
    var vm = this;

    vm.model = {};

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }
}
