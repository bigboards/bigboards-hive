angular.module('hive.dashboard.controllers', [])
    .controller('DashboardController', ['$scope', function($scope) {
    
    }]);

angular.module('hive.dashboard', ['hive.dashboard.controllers', 'hive.core'])
    .config(['$routeProvider', 'USER_ROLES', function($routeProvider, USER_ROLES) {
        $routeProvider
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'app/dashboard/view.html',
                controller: 'DashboardController',
                data: {
                    authorizedRoles: [ USER_ROLES.all ]
                },
                resolve: {
                    auth: function(AuthResolver) {
                        return AuthResolver.resolve();
                    }
                }
            });
    }]);