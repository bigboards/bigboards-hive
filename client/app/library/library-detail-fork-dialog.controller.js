angular.module('hive.library')
    .controller('LibraryDetailForkDialogController', LibraryDetailForkDialogController);

LibraryDetailForkDialogController.$inject = ['$mdDialog', 'tint'];

function LibraryDetailForkDialogController($mdDialog, tint) {
    var vm = this;

    vm.model = {
        tint: tint
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
