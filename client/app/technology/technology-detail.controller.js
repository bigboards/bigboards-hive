angular.module('hive.technology').controller('TechnologyDetailController', TechnologyDetailController);

TechnologyDetailController.$inject = ['$mdDialog', '$mdToast', 'auth', 'technology', 'versions', 'AuthUtils', 'TechnologyService'];

function TechnologyDetailController($mdDialog, $mdToast, auth, technology, versions, AuthUtils, TechnologyService) {
    var vm = this;

    vm.technology = technology;
    vm.view = getViewUrl();
    vm.versionView = getVersionViewUrl();
    vm.versions = versions;

    vm.add = addTechnologyVersion;
    vm.saveField = saveField;

    function getViewUrl() {
        if (AuthUtils.isAllowed(auth, 'technology', 'patch')) return '/app/technology/editable/technology.part.html';
        else return '/app/technology/readonly/technology.part.html';
    }

    function getVersionViewUrl() {
        if (versions.hits.length == 0) return '/app/technology/no-versions.html';
        return '/app/technology/version-list.html';
    }

    function saveField(field) {
        if (vm.technology.data.hasOwnProperty(field)) {
            TechnologyService.patch(vm.technology.id, [
                {op: 'set', fld: field, val: vm.technology.data[field]}
            ]);
        }
    }

    function addTechnologyVersion(ev) {
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
                TechnologyService.versions.add(vm.technology.id, model).then(function(data) {
                    $mdToast.show($mdToast.simple()
                        .content('The technology version has been added')
                        .position('top right')
                        .hideDelay(3000));

                    if (!vm.versions) vm.versions = [];
                    vm.versions.push(data);

                }, function() {
                    $mdToast.show($mdToast.simple()
                        .content('Unable to add the technology version')
                        .position('top right')
                        .hideDelay(3000));
                });
            });
    }
}