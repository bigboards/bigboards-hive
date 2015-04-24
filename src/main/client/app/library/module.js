app.controller('LibraryController', ['$scope', 'Library', function($scope, Library) {
    $scope.stacks = [];
    $scope.tutorials = [];

    $scope.filter = {
        type: null,
        owner: null,
        q: null
    };

    $scope.search = function() {
        var stacksFilter = {
            type: 'stacks',
            owner: $scope.filter.owner,
            q: $scope.filter.q
        };

        Library.search(stacksFilter).$promise.then(function(results) {
            $scope.stacks = results.data;
        });

        var tutorialsFilter = {
            type: 'tutorials',
            owner: $scope.filter.owner,
            q: $scope.filter.q
        };

        Library.search(tutorialsFilter).$promise.then(function(results) {
            $scope.tutorials = results.data;
        });
    };

    $scope.search();

}]);