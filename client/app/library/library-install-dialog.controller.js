angular.module('hive.library')
    .controller('LibraryInstallDialogController', LibraryInstallDialogController);

LibraryInstallDialogController.$inject = ['$mdDialog', 'tint', 'clusters'];

function LibraryInstallDialogController($mdDialog, tint, clusters) {
    var vm = this;

    vm.model = {
        tint: tint,
        clusters: clusters
    };

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.cluster);
    }
}
