angular.module('hive.clusters')
    .controller('ClusterDeviceDialogController', ClusterDeviceDialogController);

ClusterDeviceDialogController.$inject = ['$mdDialog', 'auth', 'DeviceService'];

function ClusterDeviceDialogController($mdDialog, auth, DeviceService) {
    var vm = this;

    vm.model = null;

    vm.cancel = cancel;
    vm.ok = save;

    vm.device = {
        searchText: '',
        search: searchDevices
    };

    function cancel() {
        $mdDialog.cancel();
    }

    function save() {
        $mdDialog.hide(vm.model);
    }

    function searchDevices() {
        return DeviceService.filter.byName(vm.device.searchText).then(function(response) {
            return response.data;
        });
    }
}
