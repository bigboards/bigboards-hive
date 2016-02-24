angular.module('hive.clusters')
    .controller('ClusterEditDialogController', ClusterEditDialogController);

ClusterEditDialogController.$inject = ['$mdDialog', 'model'];

function ClusterEditDialogController($mdDialog, model) {
    var vm = this;

    vm.model = model;
    vm.patches = [];

    vm.patch = patch;
    vm.cancel = cancel;
    vm.ok = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function patch(field, newValue) {
        vm.patches.push({op: 'set', fld: field, val: newValue});
    }

    function save() {
        $mdDialog.hide(vm.patches);
    }
}
