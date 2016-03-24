angular.module('hive.stack')
    .controller('StackVersionController', StackVersionController);

StackVersionController.$inject = [ '$mdToast', '$mdDialog', 'StackService', 'auth', 'AuthUtils', 'profileId', 'slug', 'versionId', 'Dialogs', 'Feedback' ];

function StackVersionController($mdToast, $mdDialog, StackService, auth, AuthUtils, profileId, slug, versionId, Dialogs, Feedback) {
    var vm = this;

    vm.loading = true;
    vm.version = null;
    vm.can = {
        add: AuthUtils.isAllowed(auth, 'stack', 'create'),
        edit: AuthUtils.isAllowed(auth, 'stack', 'patch'),
        remove: AuthUtils.isAllowed(auth, 'stack', 'remove')
    };

    vm.actions = {
        version: {
            edit: showVersionEditDialog
        },
        resource: {
            add: showResourceAddDialog,
            remove: showResourceRemoveDialog
        },
        technologyVersion: {
            add: showTechnologyVersionAddDialog,
            remove: showTechnologyVersionRemoveDialog
        }
    };

    StackService.get(profileId, slug).then(function(response) {
        vm.stack = response;
        vm.loading = false;
    });

    StackService.versions.list(profileId, slug).then(function(response) {
        vm.versions = response.hits;
    });

    function showVersionEditDialog(ev) {
        Dialogs.edit(ev, 'EditStackDialogController', '/app/stack/edit-stack.dialog.html', vm.version)
            .then(function(patches) {
                StackService.patch(profileId, slug, patches).then(
                    Feedback.saved(),
                    Feedback.fail("Unable to save the stack details!")
                );
            });
    }

    function showResourceAddDialog(ev) {
        Dialogs.edit(ev, 'AddResourceDialogController', '/app/stack/add-resource.dialog.html', {})
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

    function showResourceRemoveDialog(ev, resource) {
        Dialogs.remove(ev, 'Would you like to remove the ' + resource.id + ' resource from this stack version?', 'Remove resource')
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

    function showTechnologyVersionAddDialog(ev) {
        Dialogs.edit(ev, 'AddTechnologyVersionDialogController', '/app/stack/add-technology-version.dialog.html', {})
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

    function showTechnologyVersionRemoveDialog(ev, technologyVersion) {
        Dialogs.remove(ev, 'Would you like to remove the ' + technologyVersion + ' technology version from this stack version?', 'Remove technology version')
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

}