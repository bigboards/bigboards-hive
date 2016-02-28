
angular.module('hive')
    .controller('CollaboratorDialogController', CollaboratorDialogController);

CollaboratorDialogController.$inject = ['$mdDialog'];

function CollaboratorDialogController($mdDialog) {
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