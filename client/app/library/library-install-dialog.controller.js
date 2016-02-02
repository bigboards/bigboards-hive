
angular.module('hive.library')
    .controller('LibraryInstallDialogController', LibraryInstallDialogController);

LibraryInstallDialogController.$inject = ['$location', '$mdDialog', 'clusters', 'auth'];

function LibraryInstallDialogController($location, $mdDialog, clusters, auth) {
    var vm = this;

    clusters.$promise.then(function(result) {
        vm.clusters = result.data;
    });

    vm.model = null;

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }
}