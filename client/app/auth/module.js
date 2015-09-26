angular.module('hive.auth.resources', [])
    .factory('Auth', ['$resource', 'settings', function($resource, settings) {
        return $resource(
            settings.api + '/api/v1/auth/:token',
            { token: '@token'},
            {
                'logout': { method: 'DELETE', isArray: false},
                'get': { method: 'GET', isArray: false}
            });
    }]);

angular.module('hive.auth', ['hive.auth.services', 'hive.core'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'app/login/view.html',
                controller: 'LoginController',
                resolve: {
                    context: ['$route', 'Session', function($route, Session) {
                        var context = {
                            mode: 'login'
                        };

                        if ($route.current.params.token) {
                            context.mode = 'validate';
                            context.token = $route.current.params.token;

                            //Session.initialize($route.current.params.token);
                        } else if ($route.current.params.error) {
                            context.mode = 'error';
                            context.error = $route.current.params.error;
                        } else if ($route.current.params.bye) {
                            Session.destroy();
                        }

                        return context;
                    }]
                }
            })
            .when('logout', {
                templateUrl: 'app/login/view.html',
                controller: 'LoginController',
                resolve: {
                    context: ['$route', 'Session', function($route, Session) {
                        var context = {
                            mode: 'login'
                        };

                        Session.destroy();

                        return context;
                    }]
                }
            })
    }]);