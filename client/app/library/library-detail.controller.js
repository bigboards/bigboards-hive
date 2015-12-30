angular.module('hive.library')
    .controller('LibraryDetailController', LibraryDetailController);

LibraryDetailController.$inject = ['$location', '$mdDialog', 'tint', 'auth', 'AuthUtils', 'LibraryService'];

function LibraryDetailController($location, $mdDialog, tint, auth, AuthUtils, LibraryService) {
    var vm = this;

    vm.tint = tint;

    vm.iAmOwner = AuthUtils.isCollaboratorOf(auth, tint);
    vm.view = '/app/library/partials/detail.part.html';
    vm.tab = 'detail';
    vm.model = null;

    vm.open = open;
    vm.select = select;
    vm.isForkable = isForkable;
    vm.clone = clone;

    function open(tab) {
        vm.tab = tab;
        vm.view = '/app/library/partials/' + tab + '.part.html';
        vm.model = null;
    }

    function select(model) {
        vm.model = model;
    }

    function isForkable() {
        return auth.isAuthenticated && !AuthUtils.isOwnerOf(auth, vm.tint);
    }

    function clone() {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to fork the tint?')
            .content('Are you sure you want to fork the ' + vm.tint.data.name + ' tint?')
            .ok('Clone')
            .cancel('Cancel')
            .targetEvent(ev);

        $mdDialog
            .show(confirm)
            .then(function() {
                return LibraryService.clone(vm.tint.data).$promise.then(function(tint) {
                    $location.path('/library/' + tint.data.type + '/' + tint.data.owner + '/' + tint.data.slug);
                });
            });

    }
}