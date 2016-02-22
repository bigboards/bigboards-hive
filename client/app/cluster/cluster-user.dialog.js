angular.module('hive.clusters')
    .controller('ClusterUserDialogController', ClusterUserDialogController);

ClusterUserDialogController.$inject = ['ClusterService', 'People', '$mdDialog', 'cluster'];

function ClusterUserDialogController(ClusterService, People, $mdDialog, cluster) {
    var vm = this;

    vm.users = cluster.data.collaborators;
    vm.cancel = cancel;
    vm.user = {
        searchText: '',
        query: queryUsers,
        add: addUser,
        remove: removeUser
    };

    function cancel() {
        $mdDialog.cancel();
    }

    function queryUsers() {
        return People.get({q: vm.user.searchText}).$promise.then(function(response) {
            return response.data;
        });
    }

    function addUser() {
        if (! vm.user.selected) return;
        if (! vm.users) vm.users = [];

        var alreadyExists = false;
        vm.users.forEach(function(user) {
            if (user.id == vm.user.selected.id)
                alreadyExists = true;
        });

        if (! alreadyExists) {
            var clusterUser = {
                id: vm.user.selected.id,
                name: vm.user.selected.data.name,
                email: vm.user.selected.data.email,
                permissions: [ 'all' ]
            };

            // -- update the backend
            ClusterService.users.add(cluster.id, clusterUser).then(function() {
                // -- update the frontend
                vm.users.push(clusterUser);
            });
        }

        vm.user.searchText = '';
        vm.user.selected = null;
    }

    function removeUser(ev, clusterUser) {
        var idx = vm.users.indexOf(clusterUser);
        if (idx != -1) {
            ClusterService.users.remove(cluster.id, clusterUser).then(function() {
                vm.users.splice(idx, 1);
            });
        }
    }
}
