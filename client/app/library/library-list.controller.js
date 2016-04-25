angular.module('hive.library')
    .controller('LibraryController', LibraryController);

LibraryController.$inject = ['$location', '$mdDialog', '$mdToast', '$routeParams', 'LibraryService', 'auth'];

function LibraryController($location, $mdDialog, $mdToast, $routeParams, LibraryService, auth) {
    var vm = this;

    vm.items = [];
    vm.isLoggedIn = auth.isAuthenticated;
    vm.loading = true;

    vm.hasMore = true;
    vm.search = search;
    vm.goto = goto;
    vm.removeTint = removeTint;
    vm.loadMore = loadMore;
    vm.create = {
        stack: addStack
    };

    function search() {
        var filter = {
            t: $routeParams.type ? $routeParams.type : null,
            o: $routeParams.owner ? $routeParams.owner : null,
            architecture: $routeParams.architecture ? $routeParams.architecture : 'all',
            firmware: $routeParams.firmware ? $routeParams.firmware : null,
            q: $routeParams.q ? $routeParams.q : null,
            scope: 'public',
            s: 20
        };

        if (auth.isAuthenticated) {
            filter.scope = null;
            filter.o = auth.profile.hive_id;
            filter.c = auth.profile.hive_id;

            LibraryService.search(filter).$promise.then(function (results) {
                vm.items = results.data;
                vm.hasMore = (results.total > vm.items.length);
                vm.loading = false;
            });
        } else {
            LibraryService.search(filter).$promise.then(function(results) {
                vm.items = results.data;
                vm.hasMore = (results.total > vm.items.length);
                vm.loading = false;
            });
        }
    }

    function addStack(ev) {
        $mdDialog.show({
            controller: 'LibraryStackDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/library/stack.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
            }
        })
        .then(function(model) {
                model.type = 'stack';
                model.scope = 'private';

                LibraryService.add(model).$promise.then(function(data) {
                    $mdToast.show($mdToast.simple()
                        .content('Your tint is created')
                        .position('top right')
                        .hideDelay(3000));

                    $location.path('/library/' + model.type + '/' + model.owner + '/' + model.slug);
                }, function() {
                    $mdToast.show($mdToast.simple()
                            .content('Your tint is not created due to an error')
                            .position('top right')
                            .hideDelay(3000)
                    );
                });
        });
    }

    function goto(ev, item) {
        $location.path('/library/' + item.data.type + '/' + item.data.owner + '/' + item.data.slug);
    }

    function loadMore() {
        var filter = {
            t: $routeParams.type ? $routeParams.type : null,
            o: $routeParams.owner ? $routeParams.owner : null,
            architecture: $routeParams.architecture ? $routeParams.architecture : 'all',
            firmware: $routeParams.firmware ? $routeParams.firmware : null,
            q: $routeParams.q ? $routeParams.q : null,
            scope: 'public',
            f: vm.items.length,
            s: 20
        };

        if (auth.isAuthenticated) {
            filter.scope = null;
            filter.o = auth.profile.hive_id;
            filter.c = auth.profile.hive_id;

            LibraryService.search(filter).$promise.then(function (results) {
                results.data.forEach(function(item) {
                    vm.items.push(item);
                });

                vm.hasMore = (results.total > vm.items.length);
                vm.loading = false;
            });
        } else {
            LibraryService.search(filter).$promise.then(function(results) {
                results.data.forEach(function(item) {
                    vm.items.push(item);
                });

                vm.hasMore = (results.total > vm.items.length);
                vm.loading = false;
            });
        }
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