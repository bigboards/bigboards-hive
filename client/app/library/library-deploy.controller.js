angular.module('hive.library')
    .controller('LibraryDeployController', LibraryDeployController);

LibraryDeployController.$inject = ['$q', '$log', 'auth', 'tint', 'cluster', 'nodes', 'model', 'ClusterService'];

function LibraryDeployController($q, $log, auth, tint, cluster, nodes, model, ClusterService) {
    var vm = this;

    vm.model = model;
    vm.cluster = cluster;
    vm.nodes = nodes;
    vm.tint = tint;
    vm.loading = false;

    vm.isLoggedIn = auth.isAuthenticated;
    vm.instanceCountReached = instanceCountReached;
    vm.select = select;
    vm.install = install;
    vm.isSelected = isSelected;

    function instanceCountReached(group) {
        if (model[group.name].maxInstances == 0) return false;
        else return model[group.name].maxInstances <= model[group.name].instances.length;
    }

    function isSelected(group, node) {
        return model[group.name].instances.indexOf(node.id) != -1;
    }

    function select(group, node) {
        var idx = model[group.name].instances.indexOf(node.id);
        if (idx == -1) {
            model[group.name].instances.push(node.id);
        } else {
            model[group.name].instances.splice(idx, 1);
        }
    }

    function install() {
        var data = vm.tint.data;

        data.stack.groups.forEach(function(group) {
            group.runs_on = model[group.name].instances.join(':');
        });

        ClusterService.tints.install(cluster.id, data).then(function() {
            $log.info('Tint installed');
        }, function(error) {
            $log.error(error);
        });
    }
}