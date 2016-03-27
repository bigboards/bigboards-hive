
angular.module('hive.stack')
    .controller('StackVersionResourceDialogController', StackVersionResourceDialogController);

StackVersionResourceDialogController.$inject = ['$mdDialog', 'model'];

function StackVersionResourceDialogController($mdDialog, model) {
    var vm = this;

    vm.mode = (model.id) ? "edit" : "add";
    vm.model = model;

    if (! vm.model.provider) vm.model.provider = "git";
    if (! vm.model.settings) vm.model.settings = {};

    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }
}