angular.module('hive.technology').controller('TechnologyController', TechnologyController);

TechnologyController.$inject = ['$routeParams', '$location', '$mdDialog', '$mdToast', 'auth', 'AuthUtils', 'TechnologyService'];

function TechnologyController($routeParams, $location, $mdDialog, $mdToast, auth, AuthUtils, TechnologyService) {
    var vm = this;

    vm.items = [];
    vm.loading = {
        technology: true,
        version: true
    };

    vm.editable = AuthUtils.isAllowed(auth, 'technology', 'patch');
    vm.scopes = [
        {label: "Public", value: 'public'},
        {label: "Private", value: 'private'}
    ];

    vm.back = back;
    vm.select = select;
    vm.remove = remove;
    vm.add = add;
    vm.saveField = saveField;

    TechnologyService.get($routeParams.id).then(function(response) {
        vm.technology = response;
    }).finally(function() { vm.loading.technology = false});

    TechnologyService.versions.list($routeParams.id).then(function(response) {
        vm.items = response.hits;
    }).finally(function() { vm.loading.version = false});

    function add(ev) {
        $mdDialog.show({
                controller: 'AddTechnologyVersionDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/technology/add-technology-version.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                }
            })
            .then(function(model) {
                TechnologyService.versions.add(vm.technology.id, model).then(
                    okToastFn('The technology version has been added'),
                    failToastFn('Unable to add the technology version')
                ).then(function(data) {
                    if (!vm.items) vm.items = [];
                    vm.items.push({id: vm.technology.id + ':' + data.version, data: model});
                });
            });
    }

    function back() {
        $location.path('/technologies');
    }

    function select(item) {
        $location.path('/technologies/' + vm.technology.id + '/' + item.data.version);
    }

    function remove(item) {
        TechnologyService.versions.remove(vm.technology.id, item.data.version).then(
            okToastFn('Removed!'),
            failToastFn('Unable to remove the technology version')
        ).then(function() {
            var idx = vm.items.indexOf(item);
            if (idx != -1) vm.items.splice(idx, 1);
        });
    }

    function saveField(field, newValue) {
        if (vm.technology.data.hasOwnProperty(field)) {
            TechnologyService.patch(vm.technology.id, [
                {op: 'set', fld: field, val: newValue}
            ]).then(okToastFn("Saved!"), failToastFn("Unable to save the " + field + " data"));
        }
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