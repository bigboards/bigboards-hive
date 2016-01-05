angular.module('hive.devices')
    .factory('DeviceService', DeviceService);

DeviceService.$inject = [ 'settings', '$resource' ];

function DeviceService(settings, $resource) {
    var resource = $resource(
        settings.api + '/api/v1/devices/:clusterId',
        { clusterId: '@clusterId' },
        {
            'list': { method: 'GET', isArray: false},
            'filter': { method: 'GET', isArray: false, params: {clusterId: 'filter'}},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'PUT', params: {type: null, owner: null, slug: null} },
            'remove': { method: 'DELETE' }
        });

    return {
        filter: {
            byName: filterByName
        }
    };

    function filterByName(name) {
        return resource.list({name: name}).$promise;
    }
}
