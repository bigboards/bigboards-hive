angular.module('hive.library')
    .controller('LibraryDetailController', LibraryDetailController);

LibraryDetailController.$inject = ['$scope', '$location', '$mdDialog', '$mdToast', 'Logger', 'tint', 'auth', 'AuthUtils', 'settings', 'LibraryService', 'People'];

function LibraryDetailController($scope, $location, $mdDialog, $mdToast, Logger, tint, auth, AuthUtils, settings, LibraryService, People) {
    var vm = this;
    vm.loading = true;

    tint.$promise.then(function(actualTint) {
        vm.tint = actualTint;
        vm.loading = false;
        vm.view = getViewUrl('detail');

        if (isCollaborator()) {
            $scope.$watch('vm.tint.data', function (newVal, oldVal) {
                if (newVal == oldVal) return;

                saveTint();
            }, true);
        }
    });

    vm.isCollaborator = isCollaborator;
    vm.tab = 'detail';
    vm.model = null;
    vm.firmwares = settings.firmwares;
    vm.architectures = settings.architectures;

    vm.open = open;
    vm.select = select;
    vm.isForkable = isForkable;
    vm.clone = clone;
    vm.remove = remove;
    vm.removeModel = removeModel;
    vm.hasFirmware = hasFirmware;
    vm.toggleFirmware = toggleFirmware;

    vm.create = {
        container: addContainer,
        group: addGroup,
        view: addView
    };

    vm.collaborator = {
        searchText: '',
        query: queryCollaborators,
        save: saveCollaborator,
        remove: removeCollaborator
    };

    vm.ports = {
        model: {},
        edit: partEditHandler('ports'),
        save: partSaveHandler('ports'),
        remove: partRemoveHandler('ports', 'port mapping')
    };

    vm.environment = {
        model: {},
        edit: partEditHandler('environment'),
        save: partSaveHandler('environment'),
        remove: partRemoveHandler('environment', 'environment variable')
    };

    vm.volumes = {
        model: {},
        edit: partEditHandler('volumes'),
        save: partSaveHandler('volumes'),
        remove: partRemoveHandler('volumes', 'volume')
    };

    vm.volumes_from = {
        searchText: '',
        query: containerQueryHandler('volumes_from'),
        save: linkSaveHandler('volumes_from'),
        remove: partRemoveHandler('volumes_from', 'volume link')
    };

    vm.links = {
        searchText: '',
        query: containerQueryHandler('links'),
        save: linkSaveHandler('links'),
        remove: partRemoveHandler('links', 'container link')
    };

    vm.containers = {
        searchText: '',
        query: containerQueryHandler('containers'),
        save: linkSaveHandler('containers'),
        remove: partRemoveHandler('containers', 'container')
    };

    function getViewUrl(tab) {
        if (isCollaborator()) return '/app/library/partials/editable/' + tab + '.part.html';
        else return '/app/library/partials/readonly/' + tab + '.part.html';
    }

    function open(tab) {
        vm.tab = tab;

        if (vm.tab == 'detail') {
            vm.view = getViewUrl(vm.tab);
        }
    }

    function select(model) {
        vm.model = model;
        vm.view = getViewUrl(vm.tab);
    }

    function isCollaborator() {
        return AuthUtils.isCollaboratorOf(auth, tint);
    }

    function isForkable() {
        return auth.isAuthenticated;
    }

    function clone(ev) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: '/app/library/detail-fork.dialog.html',
            controller: 'LibraryDetailForkDialogController',
            controllerAs: 'vm',
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                // copy the source object because it is watched!
                tint: angular.copy(vm.tint)
            }
        })
        .then(function(model) {
            return LibraryService.clone(model.tint.data).$promise.then(function(tint) {
                $mdToast.show($mdToast.simple()
                    .textContent('Your tint was created.')
                    .position('top right')
                    .hideDelay(3000));

                $location.path('/library/' + tint.data.type + '/' + tint.data.owner + '/' + tint.data.slug);
            }, function() {
                $mdToast.show($mdToast.simple()
                    .textContent('Creating your tint failed!')
                    .position('top right')
                    .hideDelay(3000)
                );
            });
        });
    }

    function remove(ev) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Remove?')
            .content('Are you sure you want to remove the ' + vm.tint.data.name + ' tint?')
            .ok('Remove')
            .cancel('Cancel')
            .targetEvent(ev);

        $mdDialog
            .show(confirm)
            .then(function() {
                return LibraryService.remove(vm.tint.data.type, vm.tint.data.owner, vm.tint.data.slug).$promise.then(function(tint) {
                    $location.path('/library');
                });
            });
    }

    function addContainer() {
        var item = {
            name: 'new container',
            image: null,
            command: null,
            ports: [],
            volumes: [],
            volumes_from: [],
            links: []
        };

        vm.tint.data.stack['containers'].push(item);
        open('container');
        select(item);
    }

    function addGroup() {
        var item = {
            name: 'new group',
            runs_on: null,
            containers: []
        };

        vm.tint.data.stack['groups'].push(item);
        open('group');
        select(item);
    }

    function addView() {
        var item = {
            label: 'new view',
            url: null,
            description: null
        };

        vm.tint.data.stack['views'].push(item);
        open('view');
        select(item);
    }

    function removeModel(ev) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to remove the ' + ((vm.model.label) ? vm.model.label : vm.model.name) + ' ' + vm.tab + '?')
            .content('Are you sure you want to delete the ' + ((vm.model.label) ? vm.model.label : vm.model.name) + ' ' + vm.tab + ' from the ' + vm.tint.data.name + ' tint?')
            .ok('Remove')
            .cancel('Cancel')
            .targetEvent(ev);

        var collectionProperty = vm.tab + 's';
        var idx = vm.tint.data.stack[collectionProperty].indexOf(vm.model);

        $mdDialog
            .show(confirm)
            .then(function() {
                if (idx > -1) {
                    vm.tint.data.stack[collectionProperty].splice(idx, 1);
                }

                vm.model = null;
                vm.view = null;
            });
    }

    function saveTint() {
        return LibraryService.update(
            vm.tint.data.type,
            vm.tint.data.owner,
            vm.tint.data.slug,
            vm.tint.data
        ).$promise;
    }

    function toggleFirmware(item) {
        var idx = (! vm.tint.data.supported_firmwares) ? -1 : vm.tint.data.supported_firmwares.indexOf(item.codename);
        if (idx > -1) vm.tint.data.supported_firmwares.splice(idx, 1);
        else vm.tint.data.supported_firmwares.push(item.codename);
    }

    function hasFirmware(firmware) {
        if (! vm.tint || !vm.tint.data || !vm.tint.data.supported_firmwares) return false;
        return vm.tint.data.supported_firmwares.indexOf(firmware.codename) > -1;
    }

    function queryCollaborators() {
        return People.get({q: vm.collaborator.searchText}).$promise.then(function(response) {
            return response.data;
        });
    }

    function saveCollaborator() {
        if (! vm.collaborator.selected) return;
        if (!vm.tint.data.collaborators) vm.tint.data.collaborators = [];

        var alreadyExists = false;
        vm.tint.data.collaborators.forEach(function(collaborator) {
            if (collaborator.id == vm.collaborator.selected.id)
                alreadyExists = true;
        });

        if (! alreadyExists) {
            vm.tint.data.collaborators.push({
                id: vm.collaborator.selected.id,
                name: vm.collaborator.selected.data.name,
                email: vm.collaborator.selected.data.email,
                permissions: [ 'all' ]
            });

            saveTint();
        }

        vm.collaborator.searchText = '';
        vm.collaborator.selected = null;
    }

    function removeCollaborator(ev, item) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Remove?')
            .content('Are you sure you want to remove "' + item.name + '" as a collaborator?')
            .ok('Remove')
            .cancel('Cancel')
            .targetEvent(ev);

        var idx = vm.tint.data.collaborators.indexOf(item);
        if (idx != -1) {
            $mdDialog
                .show(confirm)
                .then(function () {
                    vm.tint.data.collaborators.splice(idx, 1);
                    saveTint();
                });
        }
    }

    function containerQueryHandler(type) {
        return function() {
            var res = [];

            vm.tint.data.stack.containers.forEach(function(container) {
                if (container.name.indexOf(vm[type].searchText) != -1) res.push(container);
            });

            return res;
        }
    }

    function linkSaveHandler(type) {
        return function () {
            if (! vm[type].selected) return;
            if (! vm.model[type]) vm.model[type] = [];

            var alreadyExists = false;
            vm.model[type].forEach(function(item) {
                if (item == vm[type].selected.name)
                    alreadyExists = true;
            });

            if (! alreadyExists) {
                vm.model[type].push(vm[type].selected.name);

                saveTint();
            }

            vm[type].searchText = '';
            vm[type].selected = null;
        }
    }

    function partSaveHandler(type) {
        return function () {
            if (vm[type].model) {
                if (!vm[type].editing) {
                    if (!vm.model[type]) vm.model[type] = [];
                    vm.model[type].push(vm[type].model);
                }

                saveTint();
            }

            vm[type].editing = false;
            vm[type].model = {};
        }
    }

    function partEditHandler(type) {
        return function(model) {
            vm[type].editing = true;
            vm[type].model = model;
        }
    }

    function partRemoveHandler(type, typeDescription) {
        return function removePart(ev, model) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Remove?')
                .content('Are you sure you want to remove the ' + typeDescription + '?')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(ev);

            var idx = vm.model[type].indexOf(model);
            if (idx != -1) {
                $mdDialog
                    .show(confirm)
                    .then(function () {
                        vm.model[type].splice(idx, 1);
                        saveTint();
                    });
            }
        }
    }
}