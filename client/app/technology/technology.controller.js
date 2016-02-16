angular.module('hive.technology').controller('TechnologyController', TechnologyController);

TechnologyController.$inject = ['$routeParams', '$location', '$mdDialog', '$mdToast', 'auth', 'AuthUtils', 'TechnologyService'];

function TechnologyController($routeParams, $location, $mdDialog, $mdToast, auth, AuthUtils, TechnologyService) {
    var vm = this;

    vm.items = [];
    vm.loading = {
        list: true,
        detail: true
    };

    vm.view = getViewUrl();

    vm.back = back;
    vm.select = select;
    vm.remove = remove;
    vm.add = add;
    vm.saveField = saveField;

    TechnologyService.get($routeParams.id).then(function(response) {
        vm.technology = response;
    }).finally(function() { vm.loading.detail = false});

    TechnologyService.versions.list($routeParams.id).then(function(response) {
        vm.items = response.hits;
    }).finally(function() { vm.loading.list = false});

    function getViewUrl() {
        if (AuthUtils.isAllowed(auth, 'technology', 'patch')) return '/app/technology/editable/technology.part.html';
        else return '/app/technology/readonly/technology.part.html';
    }

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
                    vm.items.push(data);
                });
            });
    }

    function back() {
        $location.path('/technologies');
    }

    function select(item) {
        $location.path('/technologies/' + vm.technology.id + '/' + item.data.version);
    }

    function remove() {
        TechnologyService.remove(vm.technology.id).then(
            okToastFn('The technology version has been removed'),
            failToastFn('Unable to remove the technology version')
        ).then(function() {
            $location.path('/technologies');
        });
    }

    function saveField(field) {
        if (vm.technology.data.hasOwnProperty(field)) {
            TechnologyService.patch(vm.technology.id, [
                {op: 'set', fld: field, val: vm.technology.data[field]}
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