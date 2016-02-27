angular.module('hive.node')
    .factory('NodeService', NodeService);

NodeService.$inject = [ 'settings', '$resource' ];

function NodeService(settings, $resource) {
    var resource = $resource(
        settings.api + '/v1/nodes/:nodeId',
        { "nodeId": "@nodeId" },
        {
            'filter': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'remove': { method: 'DELETE', isArray: false}
        });

    return {
        list: filter,
        get: get,
        remove: remove
    };

    function filter(nameFilter) {
        return resource.filter({name: nameFilter}).$promise;
    }

    function get(nodeId) {
        return resource.get({nodeId: nodeId}).$promise;
    }

    function remove(nodeId) {
        return resource.remove({nodeId: nodeId}).$promise;
    }
}
