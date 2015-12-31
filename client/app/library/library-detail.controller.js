angular.module('hive.library')
    .controller('LibraryDetailController', LibraryDetailController);

LibraryDetailController.$inject = ['$scope', '$location', '$mdDialog', '$mdToast', 'tint', 'auth', 'AuthUtils', 'settings', 'LibraryService'];

function LibraryDetailController($scope, $location, $mdDialog, $mdToast, tint, auth, AuthUtils, settings, LibraryService) {
    var vm = this;

    vm.tint = tint;

    vm.isCollaborator = isCollaborator;
    vm.view = getViewUrl('detail');
    vm.tab = 'detail';
    vm.model = null;
    vm.firmwares = settings.firmwares;
    vm.architectures = settings.architectures;

    vm.open = open;
    vm.select = select;
    vm.isForkable = isForkable;
    vm.clone = clone;
    vm.removeModel = removeModel;
    vm.hasFirmware = hasFirmware;
    vm.toggleFirmware = toggleFirmware;

    if (isCollaborator()) {
        $scope.$watch('vm.tint.data', function (newVal, oldVal) {
            if (newVal == oldVal) return;

            saveTint(LibraryService, $mdToast, $scope.tint);
        }, true);
    }

    function getViewUrl(tab) {
        if (isCollaborator()) return '/app/library/partials/editable/' + tab + '.part.html';
        else return '/app/library/partials/readonly/' + tab + '.part.html';
    }

    function open(tab) {
        vm.tab = tab;
        vm.view = getViewUrl(tab);
        vm.model = null;
    }

    function select(model) {
        vm.model = model;
    }

    function isCollaborator() {
        return AuthUtils.isCollaboratorOf(auth, tint);
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

    function removeModel() {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to remove the ' + ((vm.model.label) ? vm.model.label : vm.model.name) + ' ' + vm.tab + '?')
            .content('Are you sure you want to delete the ' + ((vm.model.label) ? vm.model.label : vm.model.name) + ' ' + vm.tab + ' from the ' + vm.tint.data.name + ' tint?')
            .ok('Remove')
            .cancel('Cancel')
            .targetEvent(ev);

        var collectionProperty = vm.tab + 's';
        var idx = vm.tint.data.stack[collectionProperty].indexOf(vm.model);

        $mdDialog
            .show(confirm)
            .then(function() {
                if (idx > -1) {
                    vm.tint.data.stack[collectionProperty].splice(idx, 1);
                }

                vm.model = null;
            });
    }

    function saveTint(LibraryService, $mdToast, tint) {
        return LibraryService
            .update(vm.tint.data.type, vm.tint.data.owner, vm.tint.data.slug, vm.tint.data).$promise
            .then(function(data) {
                return data;
            }, function(error) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Saving the tint failed!')
                        .position('top right')
                        .hideDelay(3000)
                );
            });
    }

    function toggleFirmware(item) {
        var idx = vm.tint.data.supported_firmwares.indexOf(item.codename);
        if (idx > -1) vm.tint.data.supported_firmwares.splice(idx, 1);
        else vm.tint.data.supported_firmwares.push(item.codename);
    }

    function hasFirmware(firmware) {
        if (! vm.tint) return false;
        return vm.tint.data.supported_firmwares.indexOf(firmware.codename) > -1;
    }
}