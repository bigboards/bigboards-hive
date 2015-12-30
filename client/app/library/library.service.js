angular.module('hive.library')
    .factory('LibraryService', LibraryService);

LibraryService.$inject = [ 'settings', '$resource' ];

function LibraryService(settings, $resource) {
    var resource = $resource(
        settings.api + '/api/v1/library/:type/:owner/:slug/:operation',
        { type: '@type', owner: '@owner', slug: '@slug' },
        {
            'search': { method: 'GET', isArray: false, params: { type: null, owner: null, slug: null } },
            'get': { method: 'GET', isArray: false},
            'clone': { method: 'POST', isArray: false, params: { operation: 'clone'}},
            'add': { method: 'POST', params: {type: null, owner: null, slug: null} },
            'update': { method: 'POST' },
            'remove': { method: 'DELETE' }
        });

    return {
        search: function(filter, offset, size) {
            if (offset) filter.offset = offset;
            if (size) filter.size = size;

            return resource.search(filter);
        },
        get: function(type, owner, slug) {
            return resource.get({type: type, owner: owner, slug: slug});
        },
        add: function(data) {
            return resource.add({}, data);
        },
        remove: function(type, owner, slug) {
            return resource.remove({type: type, owner: owner, slug: slug });
        },
        clone: function(data) {
            return resource.clone({}, data);
        },
        update: function(type, owner, slug, data) {
            return resource.update({type: type, owner: owner, slug: slug }, data);
        }
    }
}