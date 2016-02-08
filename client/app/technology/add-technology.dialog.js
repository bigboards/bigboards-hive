
angular.module('hive.technology')
    .controller('AddTechnologyDialogController', AddTechnologyDialogController);

AddTechnologyDialogController.$inject = ['$mdDialog'];

function AddTechnologyDialogController($mdDialog) {
    var vm = this;

    vm.model = {
        name: '',
        description: null,
        logo: null,
        scope: 'public'
    };

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }
}