app.factory('LinkResource', ['$resource', 'settings', function($resource, settings) {
    return $resource(
        settings.api + '/api/v1/link',
        { },
        {
            'generate': { method: 'GET', isArray: false}
        });
}]);

app.controller('LinkController', ['$scope', 'LinkResource', 'auth', function($scope, LinkResource, auth) {
    $scope.hexes = auth.profile.hexes;
    $scope.linkToken = null;

    LinkResource.generate().$promise.then(function(response){
        $scope.linkToken = response.link_token;
    });
}]);