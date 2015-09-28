app.controller('LogoutController', ['$scope', '$rootScope', '$location', 'AuthService', 'AUTH_EVENTS', function($scope, $rootScope, $location, AuthService, AUTH_EVENTS) {
    // -- exchange the token for the user data
    AuthService.logout();
    $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
}]);