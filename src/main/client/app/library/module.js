app.controller('LibraryController', ['$scope', '$location', 'type', 'Library', function($scope, $location, type, Library) {
    $scope.items = [];

    $scope.filter = {
        type: type,
        owner: null,
        q: null
    };

    $scope.search = function() {
        Library.search($scope.filter).$promise.then(function(results) {
            $scope.items = results.data;
        });
    };

    $scope.goto = function(item) {
        $location.path('/library/' + item.data.type + '/' + item.data.owner + '/' + item.data.slug);
    };

    $scope.search();

}]);

app.controller('LibraryDetailController', ['$scope', '$location', 'tint', function($scope, $location, tint) {
    $scope.tint = tint;
}]);