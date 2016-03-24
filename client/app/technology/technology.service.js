angular.module('hive.technology')
    .factory('TechnologyService', TechnologyService);

TechnologyService.$inject = [ 'settings', '$resource' ];

function TechnologyService(settings, $resource) {
    var resource = $resource(
        settings.api + '/v1/technologies/:id',
        { id: '@id' },
        {
            'suggest': { method: 'GET', isArray: false, params: {id: "_suggest"} },
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
            'suggest': { method: 'GET', isArray: false, params: {version: "_suggest"} },
            'list': { method: 'GET', isArray: false },
            'get': { method: 'GET', isArray: false},
            'add': { method: 'POST' },
            'patch': { method: 'PATCH' },
            'remove': { method: 'DELETE' }
        });

    return {
        suggest: suggestTechnology,
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
            suggest: suggestTechnologyVersion,
            list: listVersions,
            add: addTechnologyVersion,
            get: getTechnologyVersion,
            patch: patchTechnologyVersion,
            remove: removeTechnologyVersion
        }
    };

    function suggestTechnology(query) {
        return resource.suggest({q: query}).$promise;
    }

    function suggestTechnologyVersion(technologyId, query) {
        return versionResource.suggest({id: technologyId, q: query}).$promise;
    }

    function listVersions(technologyId) {
        return versionResource.list({id: technologyId}).$promise;
    }

    function addTechnologyVersion(technologyId, data) {
        return versionResource.add({id: technologyId, version: data.version}, data).$promise;
    }

    function getTechnologyVersion(technologyId, version) {
        return versionResource.get({id: technologyId, version: version}).$promise;
    }

    function patchTechnologyVersion(technologyId, version, patches) {
        return versionResource.patch({id: technologyId, version: version}, patches).$promise;
    }

    function removeTechnologyVersion(technologyId, version) {
        return versionResource.remove({id: technologyId, version: version}).$promise;
    }
}