angular.module('hive.clusters')
    .factory('ClusterService', ClusterService);

ClusterService.$inject = [ 'settings', '$resource', '$http', 'auth', 'AuthUtils' ];

function ClusterService(settings, $resource, $http, auth, AuthUtils) {
    var resource = $resource(
        settings.api + '/v1/clusters/:profile/:slug',
        { profile: '@profile', slug: '@slug' },
        {
            'list': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false},
            'add': { method: 'POST' },
            'update': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });

    var deviceResource = $resource(
        settings.api + '/v1/clusters/:profile/:slug/nodes',
        { profile: '@slug', slug: '@slug' },
        {
            list: { method: 'GET', isArray: false}
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
        nodes: {
            list: listNodes
        },
        users: {
            add: addUser,
            remove: removeUser
        },
        link: {
            get: getLink
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

    function getCluster(clusterId) {
        return resource.get({profile: AuthUtils.id(auth), slug: clusterId}).$promise;
    }

    function createCluster(clusterId, cluster) {
        cluster.profile = AuthUtils.id(auth);

        return resource.add({profile: cluster.profile, slug: clusterId}, cluster).$promise;
    }

    function removeCluster(clusterId) {
        return resource.remove({profile: AuthUtils.id(auth), slug: clusterId}).$promise;
    }

    function listNodes(clusterId) {
        return deviceResource.list({profile: AuthUtils.id(auth), slug: clusterId}).$promise;
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

    function installTint(clusterId, tint) {
        return listDevices(clusterId).then(function(nodes) {
            var node = nodes.data[0];
            return $http.post('http://' + node.data.ipv4 + ':7000/v1/cluster/tints', tint);
        });
    }

    function getTints(clusterId) {
        return listDevices(clusterId).then(function(nodes) {
            var node = nodes.data[0];
            return $http.get('http://' + node.data.ipv4 + ':7000/v1/cluster/tints');
        });
    }

    function uninstallTint(clusterId, tint) {
        return listDevices(clusterId).then(function(nodes) {
            var node = nodes.data[0];
            return $http.delete('http://' + node.data.ipv4 + ':7000/v1/cluster/tints/' + tint.owner + '/' + tint.slug);
        });
    }
}
