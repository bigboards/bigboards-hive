angular.module('hive')
    .directive('bbRadioGroup', RadioGroup);

function RadioGroup() {
    return {
        scope: {
            choices: '=bbChoices',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            editable: '=bbEditable',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/radio-group.directive.html',
        controller: RadioGroupController,
        controllerAs: 'vm',
        bindToController: true
    };
}

RadioGroupController.$inject = [];
function RadioGroupController() {
    var vm = this;

    if (vm.showHints == null) vm.showHints = true;

    vm.lookupValue = function() {
        if (! vm.data) return '';

        for (var idx in vm.choices) {
            if (! vm.choices.hasOwnProperty(idx)) continue;
            if (vm.choices[idx] == vm.data) return vm.choices[idx].label;
        }

        return '';
    };

    vm.change = function(ev) {
        if (vm.editable && vm.onChange)
            vm.onChange({newValue: vm.data});
    };
}

