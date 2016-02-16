angular.module('hive.technology').controller('ServiceController', ServiceController);

ServiceController.$inject = ['$routeParams', '$location', '$mdDialog', '$mdToast', 'auth', 'AuthUtils', 'TechnologyService'];

function ServiceController($routeParams, $location, $mdDialog, $mdToast, auth, AuthUtils, TechnologyService) {
    var vm = this;

    vm.editable = AuthUtils.isAllowed(auth, 'technology_version', 'patch');
    vm.versionSlug = $routeParams.version;
    vm.technologyId = $routeParams.technology;
    vm.serviceId = $routeParams.service;

    vm.items = [];
    vm.loading = {
        technology: true,
        version: true
    };

    vm.back = back;
    vm.select = select;
    vm.remove = remove;
    vm.add = add;
    vm.saveField = saveField;

    var entityExpression = 'services[id="' + vm.serviceId + '"]';

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
                vm.items = service.daemons;
            }
        });

        setViewUrl('service');
    }).finally(function() {
        vm.loading.version = false;
    });

    function setViewUrl(entity) {
        var permission = (AuthUtils.isAllowed(auth, 'technology_version', 'patch')) ? 'editable' : 'readonly';

        vm.view = '/app/technology/' + permission + '/' + entity + '.part.html';
    }

    function add(ev) {
        $mdDialog.show({
                controller: 'AddItemDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/technology/add-daemon.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                }
            })
            .then(function(model) {
                // TODO: This is currently set to docker since it is the only provider we support
                model.driver = 'docker';

                TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                    {op: 'add', ent: entityExpression, fld: 'daemons', val: model}
                ]).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the daemon')
                ).then(function() {
                    if (! vm.items) vm.items = [];
                    vm.items.push(model);

                    select(model);
                });
            });
    }

    function back() {
        $location.path('/technologies/' + vm.technologyId + '/' + vm.versionSlug);
    }

    function select(item) {
        $location.path('/technologies/' + vm.technologyId + '/' + vm.versionSlug + '/' + vm.serviceId + '/' + item.id);
    }

    function remove(item) {
        TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
            {op: 'remove', ent: entityExpression, fld: 'daemons', val: item}
        ]).then(okToastFn("Removed!"), failToastFn("Unable to remove the daemon")
        ).then(function() {
            var idx = vm.items.indexOf(item);
            if (idx != -1) vm.items.splice(idx, 1);
        });
    }

    function saveField(field, newValue) {
        TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
            {op: 'set', ent: entityExpression, fld: field, val: newValue}
        ]).then(
            okToastFn('Saved!'),
            failToastFn("Unable to save the " + field + " data")
        );
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