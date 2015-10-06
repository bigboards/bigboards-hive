app.factory('LinkResource', ['$resource', 'settings', function($resource, settings) {
        return $resource(
            settings.api + '/api/v1/link',
            { },
            {
                'generate': { method: 'GET', isArray: false}
            });
    }]);

app.controller('LinkController', ['$scope', 'LinkResource', function($scope, LinkResource) {

    $scope.linkToken = null;

    LinkResource.generate().$promise.then(function(response){
        $scope.linkToken = response.link_token;
    });
}]);