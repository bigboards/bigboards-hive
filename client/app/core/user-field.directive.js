angular.module('hive')
    .directive('bbUserField', UserField);

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

UserFieldController.$inject = ['ProfileService'];
function UserFieldController(ProfileService) {
    var vm = this;

    vm.showHints = (vm.showHints == null) ? true : vm.showHints;
    vm.selected = null;
    vm.searchText = "";

    vm.query = query;
    vm.change = change;

    function query() {
        return ProfileService.list(vm.searchText).then(function(response) {
            return response.hits;
        });
    }

    function change(ev) {
        if (vm.onChange)
            vm.onChange({newValue: vm.data});
    }
}

