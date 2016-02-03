
angular.module('hive.library')
    .controller('LibraryCloneDialogController', LibraryCloneDialogController);

LibraryCloneDialogController.$inject = ['$location', '$mdDialog', 'tint', 'auth'];

function LibraryCloneDialogController($location, $mdDialog, tint, auth) {
    var vm = this;

    vm.tint = tint;

    vm.model = null;

    if (auth.profile.hive_id != tint.data.owner) {
        vm.model = tint.data.slug;
    }

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }
}