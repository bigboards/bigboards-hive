angular.module('hive.clusters')
    .factory('ClusterService', ClusterService);

ClusterService.$inject = [ 'settings', '$resource' ];

function ClusterService(settings, $resource) {
    var resource = $resource(
        settings.api + '/api/v1/cluster/:clusterId',
        { clusterId: '@clusterId' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'PUT' },
            'update': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });

    var deviceResource = $resource(
        settings.api + '/api/v1/cluster/:clusterId/device/:deviceId',
        { clusterId: '@clusterId', deviceId: '@deviceId' },
        {
            list: { method: 'GET', isArray: false},
            add: { method: 'PUT' },
            remove: { method: 'DELETE' }
        });

    var linkResource = $resource(
        settings.api + '/api/v1/link',
        { },
        {
            'generate': { method: 'GET', isArray: false}
        });

    return {
        list: listClusters,
        get: getCluster,
        create: createCluster,
        remove: removeCluster,
        devices: {
            list: listDevices,
            remove: removeDevice,
            add: addDevice
        },
        users: {
            add: addUser,
            remove: removeUser
        },
        link: {
            get: getLink
        }
    };

    function listClusters() {
        return resource.list().$promise;
    }

    function getCluster(clusterId) {
        return resource.get({clusterId: clusterId}).$promise;
    }

    function createCluster(cluster) {
        return resource.add({}, cluster).$promise;
    }

    function removeCluster(clusterId) {
        return resource.remove({clusterId: clusterId}).$promise;
    }

    function listDevices(clusterId) {
        return deviceResource.list({clusterId: clusterId}).$promise;
    }

    function removeDevice(clusterId, deviceId) {
        return deviceResource.remove({ clusterId: clusterId, deviceId: deviceId }).$promise;
    }

    function addDevice(clusterId, deviceId) {
        return deviceResource.add({ clusterId: clusterId, deviceId: deviceId }).$promise;
    }

    function addUser(clusterId, clusterUser) {
        return resource.update({clusterId: clusterId}, [{op: 'add', fld: 'collaborators', val: clusterUser, unq: true}]).$promise;
    }

    function removeUser(clusterId, clusterUser) {
        return resource.update({clusterId: clusterId}, [{op: 'remove', fld: 'collaborators', val: clusterUser}]).$promise;
    }

    function getLink() {
        return linkResource.generate().$promise;
    }
}
