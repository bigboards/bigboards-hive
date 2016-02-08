angular.module('hive.technology')
    .factory('TechnologyService', TechnologyService);

TechnologyService.$inject = [ 'settings', '$resource' ];

function TechnologyService(settings, $resource) {
    var resource = $resource(
        settings.api + '/v1/technologies/:id',
        { id: '@id' },
        {
            'filter': { method: 'GET', isArray: false },
            'get': { method: 'GET', isArray: false},
            'add': { method: 'POST' },
            'patch': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });

    var versionResource = $resource(
        settings.api + '/v1/technologies/:id/versions/:version',
        { id: '@id', version: '@version' },
        {
            'list': { method: 'GET', isArray: false },
            'get': { method: 'GET', isArray: false},
            'add': { method: 'POST' },
            'patch': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });

    return {
        filter: function(filter, offset, size) {
            if (!filter) filter = [];

            if (offset) filter.offset = offset;
            if (size) filter.size = size;

            return resource.filter(filter).$promise;
        },
        get: function(id) {
            return resource.get({id: id}).$promise;
        },
        add: function(id, data) {
            return resource.add({id: id}, data).$promise;
        },
        remove: function(id) {
            return resource.remove({id: id}).$promise;
        },
        patch: function(id, patches) {
            return resource.patch({ id:id }, patches).$promise;
        },
        versions: {
            list: listVersions,
            add: addTechnologyVersion
        }
    };

    function listVersions(technologyId) {
        return versionResource.list({id: technologyId}).$promise;
    }

    function addTechnologyVersion(technologyId, data) {
        return versionResource.add({id: technologyId, version: data.version}, data).$promise;
    }
}