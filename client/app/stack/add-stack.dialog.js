
angular.module('hive.stack')
    .controller('AddStackDialogController', AddStackDialogController);

AddStackDialogController.$inject = ['$mdDialog'];

function AddStackDialogController($mdDialog) {
    var vm = this;

    vm.model = {};

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        if (vm.model.name) vm.model.slug = vm.model.name.replace(/\s+/g, '_').toLowerCase();

        $mdDialog.hide(vm.model);
    }
}