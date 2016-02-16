angular.module('hive')
    .directive('bbCheckboxGroup', CheckboxGroup);

function CheckboxGroup() {
    return {
        scope: {
            choices: '=bbChoices',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            editable: '=bbEditable',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/checkbox-group.directive.html',
        controller: CheckboxGroupController,
        controllerAs: 'vm',
        bindToController: true
    };
}

CheckboxGroupController.$inject = [];
function CheckboxGroupController() {
    var vm = this;

    if (vm.showHints == null) vm.showHints = true;

    vm.toggleItem = function(item) {
        if (!vm.editable || !vm.onChange) return;

        var idx = vm.data.indexOf(item);

        if (idx == -1) vm.data.push(item);
        else vm.data.splice(idx, 1);

        vm.onChange({newValue: vm.data});
    };

    vm.hasItem = function(item) {
        return vm.data && (vm.data.indexOf(item) != -1);
    };

    vm.change = function(ev) {
        if (vm.editable && vm.onChange)
            vm.onChange({newValue: vm.data});
    };
}

