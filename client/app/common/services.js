app.factory('People', ['$resource', 'settings', function($resource, settings) {
    return $resource(settings.api + '/api/v1/people/:username', { username: '@username' },
        {
            'save': { method: 'PUT'}
        }
    );
}]);