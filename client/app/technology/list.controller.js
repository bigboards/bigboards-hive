angular.module('hive.technology').controller('ListController', ListController);

ListController.$inject = ['auth', '$location', '$mdDialog', '$mdToast', 'TechnologyService', 'AuthUtils'];

function ListController(auth, $location, $mdDialog, $mdToast, TechnologyService, AuthUtils) {
    var vm = this;

    vm.editable = AuthUtils.isAllowed(auth, 'technology', 'patch');
    vm.loading = true;
    vm.items = [];
    vm.isLoggedIn = auth.isAuthenticated;

    vm.select = select;
    vm.remove = remove;
    vm.addTechnology = addTechnology;

    initialize();

    function initialize() {
        TechnologyService.filter().then(function(results) {
            vm.items = results.hits;
            vm.loading = false;
        })
    }

    function select(technology) {
        $location.path('/technologies/' + technology.id);
    }

    function remove(item) {
        TechnologyService.remove(item.id)
            .then(okToastFn("Removed!"), failToastFn("Unable to remove the technology"))
            .then(function() {
                var idx = vm.items.indexOf(item);
                if (idx != -1) vm.items.splice(idx, 1);
            });
    }

    function addTechnology(ev) {
        $mdDialog.show({
                controller: 'AddItemDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/technology/add-technology.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                }
            })
            .then(function(model) {
                TechnologyService.add(model.name.toLowerCase(), model).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the technology')
                ).then(function() {
                    select(model);
                })
            });
    }

    function okToastFn(message) {
        return function(data) {
            $mdToast.show($mdToast.simple()
                .content(message)
                .position('bottom left')
                .hideDelay(1000));

            return data;
        }
    }

    function failToastFn(message) {
        return function(data) {
            $mdToast.show($mdToast.simple()
                .content(message)
                .position('bottom left')
                .hideDelay(3000));

            return data;
        }
    }
}