angular.module('hive.stack')
    .controller('StackDetailController', StackDetailController);

StackDetailController.$inject = [ '$location', '$mdToast', '$mdDialog', 'StackService', 'auth', 'AuthUtils', 'profileId', 'slug', 'Collaborators', 'Dialogs', 'Feedback' ];

function StackDetailController($location, $mdToast, $mdDialog, StackService, auth, AuthUtils, profileId, slug, Collaborators, Dialogs, Feedback) {
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
        $location.path('/stacks/' + version.id.replace(/\:/g, '/'))
    }

    function showStackEditDialog(ev) {
        Dialogs.edit(ev, 'EditStackDialogController', '/app/stack/edit-stack.dialog.html', vm.stack)
            .then(function(patches) {
                StackService.patch(profileId, slug, patches).then(
                    Feedback.saved(),
                    Feedback.saveFailed("stack")
                );
            });
    }

    function showCollaboratorAddDialog(ev) {
        function addHandler(model) {
            return StackService.collaborators.add(profileId, slug, model);
        }

        Collaborators.add(ev, addHandler, vm.stack.data);
    }

    function showVersionAddDialog(ev) {
        Dialogs.edit(ev, 'AddStackVersionDialogController', '/app/stack/add-stack-version.dialog.html', {})
            .then(function(model) {
                function onComplete(response) {
                    if (! vm.versions) vm.versions = [];
                    vm.versions.push({id: response._id, data: model});
                }

                StackService.versions.add(profileId, slug, model)
                    .then(onComplete)
                    .then(Feedback.added(), Feedback.addFailed('stack version'));
            });
    }


    function removeVersion(ev, version) {
        Dialogs.remove(ev, 'Would you like to remove the ' + version.data.name + ' version from this stack?', 'Remove Version')
            .then(function() {
                function onComplete() {
                    var idx = vm.versions.indexOf(version);
                    vm.versions.splice(idx, 1);
                }

                StackService.versions.remove(profileId, slug, version.id)
                    .then(onComplete)
                    .then(Feedback.removed(), Feedback.removeFailed('stack version'));
            });
    }

    function removeCollaborator(ev, collaborator) {
        Collaborators.remove(ev, collaborator).then(function() {
            function onComplete() {
                var idx = vm.stack.data.collaborators.indexOf(collaborator);
                vm.stack.data.collaborators.splice(idx, 1);
            }

            StackService.collaborators.remove(profileId, slug, collaborator)
                .then(onComplete)
                .then(Feedback.removed(), Feedback.removeFailed('collaborator'));
        });
    }
}