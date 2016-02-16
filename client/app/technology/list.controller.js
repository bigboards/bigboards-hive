angular.module('hive.technology').controller('ListController', ListController);

ListController.$inject = ['auth', '$location', '$mdDialog', '$mdToast', 'TechnologyService', 'AuthUtils'];

function ListController(auth, $location, $mdDialog, $mdToast, TechnologyService, AuthUtils) {
    var vm = this;

    vm.loading = true;
    vm.items = [];
    vm.isLoggedIn = auth.isAuthenticated;

    vm.goto = goto;
    vm.addTechnology = addTechnology;
    vm.getViewUrl = getViewUrl;
    vm.saveField = saveField;

    initialize();

    function initialize() {
        TechnologyService.filter().then(function(results) {
            vm.items = results.hits;
            vm.loading = false;
        })
    }

    function getViewUrl() {
        if (AuthUtils.isAllowed(auth, 'technology', 'patch')) return '/app/technology/editable/technology.part.html';
        else return '/app/technology/readonly/technology.part.html';
    }

    function goto(ev, technology) {
        $location.path('/technologies/' + technology.id);
    }

    function saveField(field) {
        if (vm.selected && vm.selected.data.hasOwnProperty(field)) {
            TechnologyService.patch(vm.selected.id, [
                {op: 'set', fld: field, val: vm.selected.data[field]}
            ]);
        }
    }

    function addTechnology(ev) {
        $mdDialog.show({
                controller: 'AddTechnologyDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/technology/add-technology.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                }
            })
            .then(function(model) {
                TechnologyService.add(model.name.toLowerCase(), model).then(function(data) {
                    $mdToast.show($mdToast.simple()
                        .content('The technology has been added')
                        .position('top right')
                        .hideDelay(3000));

                    vm.items.push(data);

                }, function() {
                    $mdToast.show($mdToast.simple()
                        .content('Unable to add the technology')
                        .position('top right')
                        .hideDelay(3000));
                });
            });
    }
}