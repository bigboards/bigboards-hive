angular.module('hive.technology').controller('TechnologyDetailController', TechnologyDetailController);

TechnologyDetailController.$inject = ['auth', 'technology', 'AuthUtils', 'TechnologyService'];

function TechnologyDetailController(auth, technology, AuthUtils, TechnologyService) {
    var vm = this;

    vm.technology = technology;
    vm.view = getViewUrl();

    vm.saveField = saveField;

    function getViewUrl() {
        if (AuthUtils.isAllowed(auth, 'technology', 'patch')) return '/app/technology/editable/technology.part.html';
        else return '/app/technology/readonly/technology.part.html';
    }

    function saveField(field) {
        if (vm.technology.data.hasOwnProperty(field)) {
            TechnologyService.patch(vm.technology.id, [
                {op: 'set', fld: field, val: vm.technology.data[field]}
            ]);
        }
    }
}