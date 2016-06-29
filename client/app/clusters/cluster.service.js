angular.module('hive.clusters')
    .factory('ClusterService', ClusterService);

ClusterService.$inject = [ 'settings', '$resource', '$http' ];

function ClusterService(settings, $resource, $http) {
    var resource = $resource(
        settings.api + '/api/v1/cluster/:clusterId',
        { clusterId: '@clusterId' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'PUT' },
            'update': { method: 'PATCH' },
            'remove': { method: 'DELETE' },
            pair: { method: 'PUT' }
        });

    var deviceResource = $resource(
        settings.api + '/api/v1/cluster/:clusterId/device/:deviceId',
        { clusterId: '@clusterId', deviceId: '@deviceId' },
        {
            list: { method: 'GET', isArray: false},
            add: { method: 'PUT' },
            remove: { method: 'DELETE' }
        });

    return {
        list: listClusters,
        get: getCluster,
        create: createCluster,
        remove: removeCluster,
        notifiedOfPairing: notifiedOfPairing,
        devices: {
            list: listDevices,
            remove: removeDevice,
            add: addDevice
        },
        users: {
            add: addUser,
            remove: removeUser
        },
        tint: {
            install: install,
            uninstall: uninstall
        },
        pair: pair
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

    function notifiedOfPairing(clusterId) {
        return resource.update({clusterId: clusterId}, [{op: 'set', fld: 'notified', val: true}]).$promise;
    }

    function addUser(clusterId, clusterUser) {
        return resource.update({clusterId: clusterId}, [{op: 'add', fld: 'collaborators', val: clusterUser, unq: true}]).$promise;
    }

    function removeUser(clusterId, clusterUser) {
        return resource.update({clusterId: clusterId}, [{op: 'remove', fld: 'collaborators', val: clusterUser}]).$promise;
    }

    function pair(pair_code) {
        return resource.pair({pair_code: pair_code}).$promise;
    }

    function install(clusterId, tint) {
        if (tint.data) tint = tint.data;

        return $http.post('http://' + clusterId + '.device.bigboards.io:7000/api/v1/hex/tints', tint);
    }

    function uninstall(clusterId, tint) {
        if (tint.data) tint = tint.data;

        return $http.delete('http://' + clusterId + '.device.bigboards.io:7000/api/v1/hex/tints/' + tint.type + '/' + tint.owner.id + '/' + tint.slug, tint);
    }
}
