angular.module('hive')
    .directive('bbTextField', UserField);

function UserField() {
    return {
        scope: {
            label: '@bbLabel',
            hint: '@bbHint',
            data: '=bbData',
            onChange: '&bbOnChange',
            showHints: '=?bbShowHints'
        },
        templateUrl: 'app/core/user-field.directive.html',
        controller: UserFieldController,
        controllerAs: 'vm',
        bindToController: true
    };
}

UserFieldController.$inject = [];
function UserFieldController() {
    var vm = this;

    vm.showHints = (vm.showHints == null) ? true : vm.showHints;
    vm.selected = null;
    vm.searchText = "";

    vm.query = query;
    vm.change = change;

    function query() {
        return People.get({q: vm.searchText}).$promise.then(function(response) {
            return response.data;
        });
    }

    function change(ev) {
        if (vm.editable && vm.onChange)
            vm.onChange({newValue: vm.data});
    }
}

