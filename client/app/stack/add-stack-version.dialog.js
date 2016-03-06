
angular.module('hive.stack')
    .controller('AddStackVersionDialogController', AddStackVersionDialogController);

AddStackVersionDialogController.$inject = ['$mdDialog'];

function AddStackVersionDialogController($mdDialog) {
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