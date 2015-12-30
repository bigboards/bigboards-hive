angular.module('hive.library')
    .controller('LibraryController', LibraryController);

LibraryController.$inject = ['$location', '$mdDialog', '$mdToast', '$routeParams', 'LibraryService', 'auth'];

function LibraryController($location, $mdDialog, $mdToast, $routeParams, LibraryService, auth) {
    var vm = this;

    vm.items = {
        all: [],
        mine: [],
        favorite: []
    };
    vm.isLoggedIn = auth.isAuthenticated;
    vm.loading = true;

    vm.search = search;
    vm.goto = goto;
    vm.removeTint = removeTint;

    function search() {
        var filter = {
            t: $routeParams.type ? $routeParams.type : null,
            o: $routeParams.owner ? $routeParams.owner : null,
            architecture: $routeParams.architecture ? $routeParams.architecture : 'all',
            firmware: $routeParams.firmware ? $routeParams.firmware : null,
            q: $routeParams.q ? $routeParams.q : null,
            scope: 'public'
        };

        LibraryService.search(filter).$promise.then(function(results) {
            vm.items.all = results.data;
            vm.loading = false;
        });

        if (auth.isAuthenticated) {
            filter.scope = null;
            filter.o = auth.profile.hive_id;
            filter.c = auth.profile.hive_id;

            LibraryService.search(filter).$promise.then(function (results) {
                vm.items.mine = results.data;
            });
        }
    }

    function goto(ev, item) {
        $location.path('/library/' + item.data.type + '/' + item.data.owner + '/' + item.data.slug);
    }

    function removeTint(ev, item) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to delete the tint?')
            .content('Are you sure you want to delete the ' + item.data.name + ' tint?')
            .ok('Yes')
            .cancel('No')
            .targetEvent(ev);

        $mdDialog
            .show(confirm)
            .then(function() {
                LibraryService
                    .remove(item.data.type, item.data.owner, item.data.slug).$promise
                    .then(function(data) {
                        var idx = vm.items.indexOf(item);
                        if (idx > -1) vm.items.splice(idx, 1);

                        $mdToast.show(
                            $mdToast.simple()
                                .content('The tint has been removed')
                                .position('top right')
                                .hideDelay(3000)
                        );
                    });
            });
    }

    search();
}