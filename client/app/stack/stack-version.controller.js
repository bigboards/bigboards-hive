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

    StackService.versions.get(profileId, slug, versionId).then(function(response) {
        vm.version = response;
        vm.loading = false;
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
        Dialogs.edit(ev, 'SelectTechnologyVersionDialogController', '/app/technology/select-technology-version.dialog.html', {})
            .then(function(model) {
                function onComplete(response) {
                    if (! vm.version.data.technology_versions) vm.version.data.technology_versions = [];
                    vm.version.data.technology_versions.push(model.id);
                }

                StackService.versions.patch(profileId, slug, versionId, [
                    { op: 'add', fld: 'technology_versions', val: model.id, unq: true}
                ])
                    .then(onComplete)
                    .then(Feedback.added(), Feedback.addFailed('technology version'));
            });
    }

    function showTechnologyVersionRemoveDialog(ev, technologyVersion) {
        Dialogs.remove(ev, 'Would you like to remove the ' + technologyVersion + ' technology version from this stack version?', 'Remove technology version')
            .then(function() {
                function onComplete() {
                    var idx = vm.version.data.technology_versions.indexOf(technologyVersion);
                    vm.version.data.technology_versions.splice(idx, 1);
                }

                StackService.versions.patch(profileId, slug, versionId, [
                        { op: 'remove', fld: 'technology_versions', val: technologyVersion}
                    ])
                    .then(onComplete)
                    .then(Feedback.removed(), Feedback.removeFailed('technology version'));
            });
    }

}