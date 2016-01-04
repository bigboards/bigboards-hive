
angular.module('hive.library')
    .controller('LibraryStackDialogController', LibraryStackDialogController);

LibraryStackDialogController.$inject = ['$location', '$mdDialog', '$mdToast', '$routeParams', 'LibraryService', 'auth'];

function LibraryStackDialogController($location, $mdDialog, $mdToast, $routeParams, LibraryService, auth) {
    var vm = this;

    vm.model = {
        owner: auth.profile.hive_id,
        owner_name: auth.profile.name,
        slug: ''
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