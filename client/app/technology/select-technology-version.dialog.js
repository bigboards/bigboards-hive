angular.module('hive')
    .controller('SelectTechnologyVersionDialogController', SelectTechnologyVersionDialogController);

SelectTechnologyVersionDialogController.$inject = ['$mdDialog', 'model'];

function SelectTechnologyVersionDialogController($mdDialog) {
    var vm = this;

    vm.result = null;

    vm.cancel = cancel;
    vm.save = save;

    vm.technologyVersionChanged = technologyVersionChanged;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.result);
    }

    function technologyVersionChanged(newValue) {
        vm.result = newValue
    }

}