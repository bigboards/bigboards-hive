angular.module('hive.node')
    .controller('NodeListController', NodeListController);

NodeListController.$inject = [ '$mdToast', '$mdDialog', 'NodeService' ];

function NodeListController($mdToast, $mdDialog, NodeService) {
    var vm = this;

    vm.loading = true;

    vm.removeNode = removeNode;

    NodeService.list().then(function(response) {
        vm.nodes = response;
        vm.loading = false;
    });

    function removeNode(ev, node) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to delete the ' + node.data.name + ' node?')
            .textContent('The node will be removed from your account. You can add it again later by linking it to your account again.')
            .ariaLabel('Remove Node')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
            NodeService.remove(node.id).then(
                okToastFn("Removed!"),
                failToastFn("Unable to remove the node!")
            ).then(function() {
                var idx = vm.nodes.indexOf(node);
                vm.nodes.splice(idx, 1);
            });
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