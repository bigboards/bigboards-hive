angular.module('hive')
    .directive('bbTextField', TextField);

function TextField() {
    return {
        scope: {
            label: '@bbLabel',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            editable: '=bbEditable',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/text-field.directive.html',
        controller: TextFieldController,
        controllerAs: 'vm',
        bindToController: true
    };
}

TextFieldController.$inject = [];
function TextFieldController() {
    var vm = this;

    if (vm.showHints == null) vm.showHints = true;

    vm.change = function(ev) {
        if (vm.editable && vm.onChange)
            vm.onChange({newValue: vm.data});
    };
}

