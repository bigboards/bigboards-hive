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
            edit: showResourceEditDialog,
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
        Dialogs.edit(ev, 'EditStackVersionDialogController', '/app/stack/edit-stack-version.dialog.html', vm.version)
            .then(function(patches) {
                StackService.versions.patch(profileId, slug, versionId, patches).then(
                    Feedback.saved(),
                    Feedback.fail("Unable to save the stack version details!")
                );
            });
    }

    function showResourceAddDialog(ev) {
        Dialogs.add(ev, 'StackVersionResourceDialogController', '/app/stack/stack-version-resource.dialog.html', {})
            .then(function(model) {
                function onComplete(response) {
                    if (! vm.version.data.resources) vm.version.data.resources = [];
                    vm.version.data.resources.push(model);
                }

                StackService.versions.patch(profileId, slug, versionId, [
                        { op: 'add', fld: 'resources', val: model, unq: true}
                    ])
                    .then(onComplete)
                    .then(Feedback.added(), Feedback.addFailed('resource'));
            });
    }

    function showResourceEditDialog(ev, resource) {
        var old = angular.copy(resource);

        Dialogs.edit(ev, 'StackVersionResourceDialogController', '/app/stack/stack-version-resource.dialog.html', resource)
            .then(function(model) {
                function onComplete(response) {
                    var idx = vm.version.data.resources.indexOf(old);
                    if (idx != -1) vm.version.data.resources[idx] = model;
                }

                StackService.versions.patch(profileId, slug, versionId, [
                        { op: 'set', fld: 'resources', val: model, old: old, unq: true}
                    ])
                    .then(onComplete)
                    .then(Feedback.saved(), Feedback.saveFailed('resource'));
            });
    }

    function showResourceRemoveDialog(ev, resource) {
        Dialogs.remove(ev, 'Would you like to remove the ' + resource.id + ' resource from this stack version?', 'Remove resource')
            .then(function() {
                function onComplete() {
                    var idx = vm.version.data.resources.indexOf(resource);
                    vm.version.data.resources.splice(idx, 1);
                }

                StackService.versions.patch(profileId, slug, versionId, [
                        { op: 'remove', fld: 'resources', val: resource}
                    ])
                    .then(onComplete)
                    .then(Feedback.removed(), Feedback.removeFailed('resource'));
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