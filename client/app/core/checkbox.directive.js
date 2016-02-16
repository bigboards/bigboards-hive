angular.module('hive')
    .directive('bbCheckbox', Checkbox);

function Checkbox() {
    return {
        scope: {
            label: '@bbLabel',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            editable: '=bbEditable',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/checkbox.directive.html',
        controller: CheckboxController,
        controllerAs: 'vm',
        bindToController: true
    };
}

CheckboxController.$inject = [];
function CheckboxController() {
    var vm = this;

    if (vm.showHints == null) vm.showHints = true;

    vm.change = function(ev) {
        if (vm.editable && vm.onChange)
            vm.onChange({newValue: vm.data});
    };
}

