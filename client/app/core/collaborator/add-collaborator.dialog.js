angular.module('hive')
    .controller('AddCollaboratorDialogController', AddCollaboratorDialogController);

AddCollaboratorDialogController.$inject = ['$mdDialog', 'model'];

function AddCollaboratorDialogController($mdDialog, model) {
    var vm = this;

    vm.model = model;
    if (! vm.model.permissions) vm.model.permissions = [];

    vm.cancel = cancel;
    vm.save = save;

    vm.profileChanged = profileChanged;
    vm.hasPermission = hasPermission;
    vm.togglePermission = togglePermission;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }

    function profileChanged(newValue) {
        vm.model.profile = newValue.id
    }

    function hasPermission(permission) {
        return vm.model.permissions.indexOf(permission) != -1;
    }

    function togglePermission(permission) {
        var idx = vm.model.permissions.indexOf(permission);
        if (idx == -1) vm.model.permissions.push(permission);
        else vm.model.permissions.splice(idx, 1);
    }
}