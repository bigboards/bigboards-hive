angular.module('hive.technology').controller('TechnologyListController', TechnologyListController);

TechnologyListController.$inject = ['auth', '$location', '$mdDialog', '$mdToast', 'TechnologyService'];

function TechnologyListController(auth, $location, $mdDialog, $mdToast, TechnologyService) {
    var vm = this;

    vm.loading = true;
    vm.items = [];
    vm.isLoggedIn = auth.isAuthenticated;

    vm.goto = goto;
    vm.addTechnology = addTechnology;

    initialize();

    function initialize() {
        TechnologyService.filter().then(function(results) {
            vm.items = results.hits;
            vm.loading = false;
        })
    }

    function goto(ev, technology) {
        $location.path('/technologies/' + technology.id);
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