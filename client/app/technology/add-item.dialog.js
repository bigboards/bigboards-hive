
angular.module('hive.technology')
    .controller('AddItemDialogController', AddItemDialogController);

AddItemDialogController.$inject = ['$mdDialog'];

function AddItemDialogController($mdDialog) {
    var vm = this;

    vm.model = {};

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        if (vm.model.name) vm.model.id = vm.model.name.replace(/\s+/g, '_').toLowerCase();

        $mdDialog.hide(vm.model);
    }
}