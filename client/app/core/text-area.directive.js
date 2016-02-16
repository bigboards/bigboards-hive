angular.module('hive')
    .directive('bbTextArea', TextArea);

function TextArea() {
    return {
        scope: {
            label: '@bbLabel',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            editable: '=bbEditable',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/text-area.directive.html',
        controller: TextAreaController,
        controllerAs: 'vm',
        bindToController: true
    };
}

TextAreaController.$inject = [];
function TextAreaController() {
    var vm = this;

    if (vm.showHints == null) vm.showHints = true;

    vm.change = function(ev) {
        if (vm.editable && vm.onChange)
            vm.onChange({newValue: vm.data});
    };
}

