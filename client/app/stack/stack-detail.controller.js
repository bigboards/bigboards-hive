angular.module('hive.stack')
    .controller('StackDetailController', StackDetailController);

StackDetailController.$inject = [ '$location', '$mdToast', '$mdDialog', 'StackService', 'auth', 'AuthUtils', 'profileId', 'slug' ];

function StackDetailController($location, $mdToast, $mdDialog, StackService, auth, AuthUtils, profileId, slug) {
    var vm = this;

    vm.loading = true;
    vm.stack = null;
    vm.versions = [];
    vm.can = {
        add: AuthUtils.isAllowed(auth, 'stack', 'create'),
        edit: AuthUtils.isAllowed(auth, 'stack', 'patch'),
        remove: AuthUtils.isAllowed(auth, 'stack', 'remove')
    };

    vm.select = select;

    vm.remove = {
        collaborator: removeCollaborator,
        version: removeVersion
    };

    vm.dialog = {
        stack: showStackEditDialog,
        collaborator: showCollaboratorAddDialog,
        version: showVersionAddDialog
    };

    StackService.get(profileId, slug).then(function(response) {
        vm.stack = response;
        vm.loading = false;
    });

    StackService.versions.list(profileId, slug).then(function(response) {
        vm.versions = response.hits;
    });

    function select(version) {
        $location.path('/stacks/' + profileId + '/' + slug + '/' + version.data.id)
    }

    function showStackEditDialog(ev) {
        $mdDialog.show({
            controller: 'EditStackDialogController',
            controllerAs: 'vm',
            templateUrl: '/app/stack/edit-stack.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                model: vm.stack
            }
        }).then(function(patches) {
            StackService.patch(profileId, slug, patches).then(
                okToastFn("Saved!"),
                failToastFn("Unable to save the stack details!")
            );
        });
    }

    function showCollaboratorAddDialog(ev) {
        $mdDialog.show({
                controller: 'AddCollaboratorDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/core/collaborator/add-collaborator.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    model: {}
                }
            })
            .then(function(model) {
                StackService.collaborators.add(profileId, slug, model).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the collaborator')
                ).then(function() {
                    if (! vm.stack.data.collaborators) vm.stack.data.collaborators = [];
                    vm.stack.data.collaborators.push(model);
                });
            });
    }

    function showVersionAddDialog(ev) {
        $mdDialog.show({
                controller: 'AddStackVersionDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/stack/add-stack-version.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    model: {}
                }
            })
            .then(function(model) {
                StackService.versions.add(profileId, slug, model).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the stack version')
                ).then(function(response) {
                    if (! vm.versions) vm.versions = [];
                    vm.versions.push({id: response._id, data: model});
                });
            });
    }


    function removeVersion(ev, version) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to remove the ' + version.data.name + ' version from this stack?')
            .ariaLabel('Remove Version')
            .targetEvent(ev)
            .ok('Remove')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            StackService.versions.remove(profileId, slug, version.id).then(
                okToastFn("Removed!"),
                failToastFn("Unable to remove the stack version!")
            ).then(function() {
                var idx = vm.versions.indexOf(version);
                vm.versions.splice(idx, 1);
            });
        });
    }

    function removeCollaborator(ev, collaborator) {
        var name = collaborator.profile && collaborator.profile.name ? collaborator.profile.name : collaborator.profile;

        var confirm = $mdDialog.confirm()
            .title('Would you like to remove ' + name + ' from the collaborator list?')
            .ariaLabel('Remove Collaborator')
            .targetEvent(ev)
            .ok('Remove')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            StackService.collaborators.remove(profileId, slug, collaborator).then(
                okToastFn("Removed!"),
                failToastFn("Unable to remove the collaborator!")
            ).then(function() {
                var idx = vm.stack.data.collaborators.indexOf(collaborator);
                vm.stack.data.collaborators.splice(idx, 1);
            });
        });
    }

    function addStack(ev) {
        $mdDialog.show({
                controller: 'AddDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/stack/add-stack.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: { }
            })
            .then(function(model) {
                StackService.add(model).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the stack')
                ).then(function() {
                    if (! vm.stacks) vm.stacks = [];
                    vm.stacks.push({id: model.id, type: 'stack', data: model});

                    //select(model);
                });
            });
    }

    function removeStack(ev, stack) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to delete the ' + stack.data.name + ' stack?')
            .ariaLabel('Remove Stack')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
            NodeService.remove(node.id).then(
                okToastFn("Removed!"),
                failToastFn("Unable to remove the stack!")
            ).then(function() {
                var idx = vm.stacks.indexOf(stack);
                vm.stacks.splice(idx, 1);
            });
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