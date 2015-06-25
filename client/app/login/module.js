app.controller('LoginController', ['$scope', 'context', 'settings', function($scope, context, settings) {
    $scope.context = context;
    $scope.api = settings.api;

    
}]);