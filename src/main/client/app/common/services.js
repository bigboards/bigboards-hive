app.factory('People', ['$resource', 'settings', function($resource, settings) {
    return $resource(settings.api + '/api/v1/people/:id', { id: '@id' });
}]);

app.factory('Library', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/:type/:owner/:slug',
        { type: '@type', owner: '@owner', slug: '@slug' },
        {
            'search': { method: 'GET', isArray: false},
            'get': { method: 'GET', isArray: false}
        });
}]);