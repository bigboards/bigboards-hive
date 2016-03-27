
angular.module('hive.stack')
    .controller('EditStackVersionDialogController', EditStackVersionDialogController);

EditStackVersionDialogController.$inject = ['$mdDialog', 'model'];

function EditStackVersionDialogController($mdDialog, model) {
    var vm = this;

    vm.model = model;
    vm.patches = [];

    vm.patch = patch;
    vm.cancel = cancel;
    vm.save = save;

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