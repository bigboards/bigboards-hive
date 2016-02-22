angular.module('hive.node')
    .controller('NodeListController', NodeListController);

NodeListController.$inject = [ 'NodeService' ];

function NodeListController(NodeService) {
    var vm = this;

    vm.nodes = NodeService.list();

}