
angular.module('hive.technology')
    .controller('AddTechnologyVersionDialogController', AddTechnologyVersionDialogController);

AddTechnologyVersionDialogController.$inject = ['$mdDialog'];

function AddTechnologyVersionDialogController($mdDialog) {
    var vm = this;

    vm.architectures = [
        "x86_64",
        "armv7l"
    ];

    vm.model = {
        version: '',
        description: null,
        architecture: null
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