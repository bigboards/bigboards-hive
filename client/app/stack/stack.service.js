angular.module('hive.stack')
    .factory('StackService', StackService);

StackService.$inject = [ 'settings', '$resource', 'auth', 'AuthUtils' ];

function StackService(settings, $resource, auth, AuthUtils) {
    var resource = $resource(
        settings.api + '/v1/stacks/:profile/:slug',
        { "profile": "@profile", "slug": "@slug" },
        {
            filter: { method: 'GET', isArray: false},
            get: { method: 'GET', isArray: false},
            add: { method: 'POST', isArray: false, params: { slug: null, profile: null}},
            patch: { method: 'PATCH', isArray: false},
            remove: { method: 'DELETE', isArray: false}
        });

    var versionResource = $resource(
        settings.api + '/v1/stacks/:profile/:slug/versions/:version',
        { "profile": "@profile", "slug": "@slug", version: "@version" },
        {
            filter: { method: 'GET', isArray: false},
            get: { method: 'GET', isArray: false},
            add: { method: 'POST', isArray: false, params: { version: null }},
            patch: { method: 'PATCH', isArray: false},
            remove: { method: 'DELETE', isArray: false}
        });

    return {
        list: filter,
        get: get,
        add: add,
        patch: patch,
        remove: remove,
        versions: {
            list: filterVersions,
            get: getVersion,
            add: addVersion,
            patch: patchVersion,
            remove: removeVersion
        },
        collaborators: {
            add: addUser,
            remove: removeUser
        }
    };

    function addUser(profile, slug, user) {
        return resource.patch({profile: profile, slug: slug}, [{op: 'add', fld: 'collaborators', val: user, unq: true}]).$promise;
    }

    function removeUser(profile, slug, user) {
        return resource.patch({profile: profile, slug: slug}, [{op: 'remove', fld: 'collaborators', val: {profile: user.profile.id, permissions: user.permissions}}]).$promise;
    }

    function filter(nameFilter) {
        return resource.filter({name: nameFilter}).$promise;
    }

    function add(data) {
        return resource.add({}, data).$promise;
    }

    function get(profile, slug) {
        return resource.get({profile: profile, slug: slug}).$promise;
    }

    function patch(profile, slug, patches) {
        return resource.patch({profile: profile, slug: slug}, patches).$promise;
    }

    function remove(nodeId) {
        return resource.remove({nodeId: nodeId}).$promise;
    }

    function getVersion(profile, slug, version) {
        return versionResource.get({profile: profile, slug: slug, version: version}).$promise;
    }

    function filterVersions(profile, slug, nameFilter) {
        return versionResource.filter({profile: profile, slug: slug, name: nameFilter}).$promise;
    }

    function addVersion(profile, slug, data) {
        return versionResource.add({profile: profile, slug: slug}, data).$promise;
    }

    function patchVersion(profile, slug, versionId, patches) {
        return versionResource.patch({profile: profile, slug: slug, version: versionId}, patches).$promise;
    }

    function removeVersion(profile, slug, versionId) {
        return versionResource.remove({profile: profile, slug: slug, version: versionId}).$promise;
    }
}
