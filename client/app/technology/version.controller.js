angular.module('hive.technology').controller('VersionController', VersionController);

VersionController.$inject = ['$routeParams', '$location', '$mdDialog', '$mdToast', 'auth', 'AuthUtils', 'TechnologyService'];

function VersionController($routeParams, $location, $mdDialog, $mdToast, auth, AuthUtils, TechnologyService) {
    var vm = this;

    vm.editable = AuthUtils.isAllowed(auth, 'technology_version', 'patch');
    vm.versionSlug = $routeParams.version;
    vm.technologyId = $routeParams.technology;
    vm.items = [];
    vm.loading = {
        technology: true,
        version: true
    };
    vm.architectures = ['x86_64', 'armv7l'];

    vm.back = back;
    vm.select = select;
    vm.remove = remove;
    vm.add = add;
    vm.saveField = saveField;

    TechnologyService.get(vm.technologyId).then(function(response) {
        vm.technology = response;
    }).finally(function() {
        vm.loading.technology = false;
    });

    TechnologyService.versions.get(vm.technologyId, vm.versionSlug).then(function(response) {
        vm.version = response;
        vm.items = response.data.services;
        if (! vm.version.data.architecture) vm.version.data.architecture = [];
        if (! Array.isArray(vm.version.data.architecture)) vm.version.data.architecture = [vm.version.data.architecture];

        setViewUrl('version');
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
                templateUrl: '/app/technology/add-service.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                }
            })
            .then(function(model) {
                TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
                    {op: 'add', fld: 'services', val: model}
                ]).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the service')
                ).then(function() {
                    if (! vm.version.data.services) vm.version.data.services = [];
                    vm.version.data.services.push(model);

                    select(model);
                });
            });
    }

    function back() {
        $location.path('/technologies/' + vm.technologyId);
    }

    function select(item) {
        $location.path('/technologies/' + vm.technologyId + '/' + vm.versionSlug + '/' + item.id);
    }

    function remove(item) {
        TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
            {op: 'remove', fld: 'services', val: item}
        ]).then(okToastFn("Removed!"), failToastFn("Unable to remove the service")
        ).then(function() {
            var idx = vm.items.indexOf(item);
            if (idx != -1) vm.items.splice(idx, 1);
        });
    }

    function saveField(field, newValue) {
        TechnologyService.versions.patch(vm.technologyId, vm.versionSlug, [
            {op: 'set', fld: field, val: newValue}
        ]).then(okToastFn("Saved!"), failToastFn("Unable to save the " + field + " data"));
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