angular.module('hive')
    .factory('ProfileService', ProfileService);

ProfileService.$inject = [ 'settings', '$resource', 'auth', 'AuthUtils' ];

function ProfileService(settings, $resource, auth, AuthUtils) {
    var resource = $resource(
        settings.api + '/v1/profiles/:profileId',
        { "profileId": "@profileId"},
        {
            filter: { method: 'GET', isArray: false},
            get: { method: 'GET', isArray: false},
            add: { method: 'POST', isArray: false, params: { profileId: null}},
            patch: { method: 'PATCH', isArray: false},
            remove: { method: 'DELETE', isArray: false}
        });

    return {
        list: filter,
        get: get,
        add: add,
        patch: patch,
        remove: remove
    };

    function filter(nameFilter) {
        return resource.filter({name: nameFilter}).$promise;
    }

    function add(data) {
        return resource.add({}, data).$promise;
    }

    function get(profileId) {
        return resource.get({profileId: profileId}).$promise;
    }

    function patch(profileId, patches) {
        return resource.patch({profileId: profileId}, patches).$promise;
    }

    function remove(profileId) {
        return resource.remove({profileId: profileId}).$promise;
    }
}
