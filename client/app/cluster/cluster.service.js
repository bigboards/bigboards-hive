angular.module('hive.clusters')
    .factory('ClusterService', ClusterService);

ClusterService.$inject = [ 'settings', '$resource', '$http', 'auth', 'AuthUtils' ];

function ClusterService(settings, $resource, $http, auth, AuthUtils) {
    var resource = $resource(
        settings.api + '/v1/clusters/:id',
        { id: '@id' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'POST' },
            'update': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });

    var nodeResource = $resource(
        settings.api + '/v1/clusters/:id/nodes',
        { id: '@id' },
        {
            list: { method: 'GET', isArray: false}
        });

    return {
        list: listClusters,
        get: getCluster,
        create: createCluster,
        patch: patchCluster,
        remove: removeCluster,
        nodes: {
            list: listNodes
        },
        collaborators: {
            add: addUser,
            remove: removeUser
        },
        tints: {
            list: getTints,
            install: installTint,
            uninstall: uninstallTint
        }
    };

    function listClusters() {
        return resource.list().$promise;
    }

    function getCluster(id) {
        return resource.get({id: id}).$promise;
    }

    function createCluster(cluster) {
        cluster.profile = AuthUtils.id(auth);

        return resource.add({}, cluster).$promise;
    }

    function patchCluster(id, patches) {
        return resource.update({id: id}, patches).$promise
    }

    function removeCluster(id) {
        return resource.remove({id: id}).$promise;
    }

    function listNodes(id) {
        return nodeResource.list({id: id}).$promise;
    }

    function addUser(id, clusterUser) {
        return resource.update({id: id}, [{op: 'add', fld: 'collaborators', val: clusterUser, unq: true}]).$promise;
    }

    function removeUser(id, clusterUser) {
        return resource.update({id: id}, [{op: 'remove', fld: 'collaborators', val: clusterUser}]).$promise;
    }

    function installTint(id, tint) {
        return listDevices(id).then(function(nodes) {
            var node = nodes.data[0];
            return $http.post('http://' + node.data.ipv4 + ':7000/v1/cluster/tints', tint);
        });
    }

    function getTints(id) {
        return listDevices(id).then(function(nodes) {
            var node = nodes.data[0];
            return $http.get('http://' + node.data.ipv4 + ':7000/v1/cluster/tints');
        });
    }

    function uninstallTint(id, tint) {
        return listDevices(id).then(function(nodes) {
            var node = nodes.data[0];
            return $http.delete('http://' + node.data.ipv4 + ':7000/v1/cluster/tints/' + tint.owner + '/' + tint.slug);
        });
    }
}
