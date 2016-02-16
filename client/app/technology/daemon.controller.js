angular.module('hive.technology').controller('DaemonController', DaemonController);

DaemonController.$inject = ['$routeParams', '$location', '$mdDialog', '$mdToast', 'auth', 'AuthUtils', 'TechnologyService'];

function DaemonController($routeParams, $location, $mdDialog, $mdToast, auth, AuthUtils, TechnologyService) {
    var vm = this;

    vm.editable = AuthUtils.isAllowed(auth, 'technology_version', 'patch');
    vm.versionSlug = $routeParams.version;
    vm.technologyId = $routeParams.technology;
    vm.serviceId = $routeParams.service;
    vm.daemonId = $routeParams.daemon;

    vm.loading = {
        technology: true,
        version: true
    };

    vm.back = back;

    vm.add = {
        label: labelDialog,
        port: portDialog,
        environmentVariable: environmentVariableDialog,
        volume: volumeDialog
    };

    vm.remove = {
        label: removeLabel,
        port: removePort,
        environmentVariable: removeEnvironmentVariable,
        volume: removeVolume
    };

    vm.saveField = saveField;
    vm.saveConfigurationField = saveConfigurationField;

    initialize();

    var entityExpression = 'services[id="' + vm.serviceId + '"].daemons[id="' + vm.daemonId + '"]';

    function initialize() {
        TechnologyService.get(vm.technologyId).then(function(response) {
            vm.technology = response;
        }).finally(function() {
            vm.loading.technology = false;
        });

        TechnologyService.versions.get(vm.technologyId, vm.versionSlug).then(function(response) {
            vm.version = response;
            response.data.services.forEach(function(service) {
                if (service.id == vm.serviceId) {
                    vm.service = service;
                    vm.service.daemons.forEach(function(daemon) {
                        if (daemon.id == vm.daemonId) {
                            vm.daemon = daemon;
                            if (! vm.daemon.configuration) vm.daemon.configuration = {};
                        }
                    });
                }
            });
        }).finally(function() {
            vm.loading.version = false;
        });
    }

    function saveConfigurationField(field, newValue) {
        TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
            {op: 'set', ent: entityExpression + '.configuration', fld: field, val: newValue}
        ]).then(
            okToastFn('Saved!'),
            failToastFn("Unable to save the " + field + " configuration data")
        );
    }

    function saveField(field, newValue) {
        TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
            {op: 'set', ent: entityExpression, fld: field, val: newValue}
        ]).then(
            okToastFn('Saved!'),
            failToastFn("Unable to save the " + field + " data")
        );
    }

    function labelDialog(ev) {
        showDialog(ev, '/app/technology/add-label.dialog.html').then(function(model) {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'add', ent: entityExpression + '.configuration', fld: 'Labels', val: model, unq: true}
            ]).then(
                okToastFn('Label set!'),
                failToastFn('Unable to set the label')
            ).then(function() {
                if (! vm.daemon.configuration.Labels) vm.daemon.configuration.Labels = {};

                vm.daemon.configuration.Labels.push(model);
            });
        });
    }

    function removeLabel(ev, label) {
        confirmDialog(ev, 'Remove label', 'Are you sure you want to remove this label?', 'Remove', 'Back').then(function() {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'remove', ent: entityExpression + '.configuration', fld: 'Labels', val: label}
            ]).then(
                okToastFn('Label removed!'),
                failToastFn('Unable to remove the label')
            ).then(function() {
                var idx = vm.daemon.configuration.Labels.indexOf(label);
                if (idx != -1)
                    vm.daemon.configuration.Labels.splice(idx, 1);
            });
        });
    }

    function environmentVariableDialog(ev) {
        showDialog(ev, '/app/technology/add-variable.dialog.html').then(function(model) {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'add', ent: entityExpression + '.configuration', fld: 'Env', val: model, unq: true}
            ]).then(
                okToastFn('Environment variable added!'),
                failToastFn('Unable to add the environment variable')
            ).then(function() {
                if (! vm.daemon.configuration.Env) vm.daemon.configuration.Env = [];

                vm.daemon.configuration.Env.push(model);
            });
        });
    }


    function removeEnvironmentVariable(ev, variable) {
        confirmDialog(ev, 'Remove environment variable', 'Are you sure you want to remove this environment variable?', 'Remove', 'Back').then(function() {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'remove', ent: entityExpression + '.configuration', fld: 'Env', val: variable}
            ]).then(
                okToastFn('Environment variable removed!'),
                failToastFn('Unable to remove the environment variable')
            ).then(function() {
                var idx = vm.daemon.configuration.Env.indexOf(variable);
                if (idx != -1)
                    vm.daemon.configuration.Env.splice(idx, 1);
            });
        });
    }

    function portDialog(ev) {
        showDialog(ev, '/app/technology/add-port.dialog.html').then(function(model) {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'add', ent: entityExpression + '.configuration', fld: 'ExposedPorts', val: model, unq: true}
            ]).then(
                okToastFn('Port added!'),
                failToastFn('Unable to add the port')
            ).then(function() {
                if (! vm.daemon.configuration.ExposedPorts) vm.daemon.configuration.ExposedPorts = [];

                if (vm.daemon.configuration.ExposedPorts.indexOf(model) == -1)
                    vm.daemon.configuration.ExposedPorts.push(model);
            });
        });
    }

    function removePort(ev, port) {
        confirmDialog(ev, 'Remove port', 'Are you sure you want to remove this port?', 'Remove', 'Back').then(function() {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'remove', ent: entityExpression + '.configuration', fld: 'ExposedPorts', val: port}
            ]).then(
                okToastFn('Port removed!'),
                failToastFn('Unable to remove the port')
            ).then(function() {
                var idx = vm.daemon.configuration.ExposedPorts.indexOf(port);
                if (idx != -1)
                    vm.daemon.configuration.ExposedPorts.splice(idx, 1);
            });
        });
    }

    function volumeDialog(ev) {
        showDialog(ev, '/app/technology/add-volume.dialog.html').then(function(model) {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'add', ent: entityExpression + '.configuration', fld: 'Mounts', val: model, unq: true}
            ]).then(
                okToastFn('Volume added!'),
                failToastFn('Unable to add the volume')
            ).then(function() {
                if (! vm.daemon.configuration.Mounts) vm.daemon.configuration.Mounts = [];

                vm.daemon.configuration.Mounts.push(model);
            });
        });
    }

    function removeVolume(ev, volume) {
        confirmDialog(ev, 'Remove volume', 'Are you sure you want to remove this volume?', 'Remove', 'Back').then(function() {
            TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                {op: 'remove', ent: entityExpression + '.configuration', fld: 'Mounts', val: volume, unq: true}
            ]).then(
                okToastFn('Volume removed!'),
                failToastFn('Unable to remove the volume')
            ).then(function() {
                var idx = vm.daemon.configuration.Mounts.indexOf(volume);
                if (idx != -1)
                    vm.daemon.configuration.Mounts.splice(idx, 1);
            });
        });
    }


    function back() {
        $location.path('/technologies/' + vm.technologyId + '/' + vm.versionSlug + '/' + vm.serviceId);
    }


    function confirmDialog(ev, title, context, ok, cancel) {
        var confirm = $mdDialog.confirm()
            .title(title)
            .textContent(context)
            .ariaLabel(title)
            .targetEvent(ev)
            .ok(ok)
            .cancel(cancel);

        return $mdDialog.show(confirm)
    }


    function showDialog(ev, template, model, controller) {
        if (! model) model = {};
        if (! controller) controller = 'AddItemDialogController';

        return $mdDialog.show({
            controller: controller,
            controllerAs: 'vm',
            templateUrl: template,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                model: model
            }
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