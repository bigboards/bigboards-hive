angular.module('hive.designer.controllers', ['hive.library.services', 'hive.core'])
    .controller('DesignerController', ['$scope', '$location', '$mdToast', '$window', 'Session', 'LibraryService', 'AuthService', function($scope, $location, $mdToast, $window, Session, LibraryService, AuthService) {
        $scope.tint = {
            supported_firmwares: [],
            owner: Session.userId
        };

        $scope.steps = [
            { code: 'basic' }
        ];
        $scope.stepIdx = 0;

        AuthService.whenLoggedIn(function(user)  {
            $scope.tint.owner = user.username;
        });

        $scope.currentStep = function() { return $scope.steps[$scope.stepIdx]; };

        $scope.hasNextStep = function() { return $scope.stepIdx < $scope.steps.length - 1; };
        $scope.hasPreviousStep = function() { return $scope.stepIdx > 0; };

        $scope.next = function() { $scope.stepIdx++; };
        $scope.previous = function()  { $scope.stepIdx--; };
        $scope.cancel = function()  { $window.history.back(); };

        $scope.finish = function() {
            LibraryService.add($scope.tint).$promise.then(function(data) {
                $mdToast.show($mdToast.simple()
                    .content('The tint has been created')
                    .position('top right')
                    .hideDelay(3000));

                $location.path('/designer/' + $scope.tint.type + '/' + $scope.tint.owner + '/' + $scope.tint.slug);
            }, function() {
                $mdToast.show($mdToast.simple()
                    .content('Creating the tint failed. Please do try again.')
                    .position('top right')
                    .hideDelay(3000)
                );
            });
        };
    }])
    .controller('BasicStepController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) { }])
    .controller('InternalDesignController', ['$scope', 'tint', 'LibraryService', 'Session', '$mdDialog', '$mdToast', 'Firmwares', 'Architectures', function($scope, tint, LibraryService, Session, $mdDialog, $mdToast, Firmwares, Architectures) {
        $scope.firmwares = Firmwares;
        $scope.architectures = Architectures;
        $scope.selectedContainer = null;
        $scope.containerSearchText = null;

        tint.$promise.then(function(response) {
            $scope.tint = response;

            // -- initialize the tint if needed
            if (! $scope.tint.data.stack) $scope.tint.data.stack = [];
            if ($scope.tint.data.stack.length == 0) $scope.tint.data.stack.push({});
            if (! $scope.tint.data.stack[0]['containers']) $scope.tint.data.stack[0]['containers'] = [];
            if (! $scope.tint.data.stack[0]['groups']) $scope.tint.data.stack[0]['groups'] = [];
            if (! $scope.tint.data.stack[0]['views']) $scope.tint.data.stack[0]['views'] = [];

            $scope.$watch('tint.data', function(newVal, oldVal) {
                if (newVal == oldVal) return;

                return LibraryService
                    .update($scope.tint.data.type, $scope.tint.data.owner, $scope.tint.data.slug, $scope.tint.data).$promise
                    .then(function(data) { return data; }, function(error) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Saving the tint failed. Please do try again.')
                                .position('top right')
                                .hideDelay(3000)
                        );
                    });
            }, true);
        });


        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.addContainer = function() {
            $scope.tint.data.stack[0]['containers'].push({
                name: null,
                image: null,
                command: null,
                ports: [],
                config: {
                    host_path: null,
                    container_path: null
                }
            });
        };

        $scope.addGroup = function() {
            $scope.tint.data.stack[0]['groups'].push({
                name: null,
                runs_on: null,
                containers: []
            });
        };

        $scope.addView = function() {
            $scope.tint.data.stack[0]['views'].push({
                label: null,
                url: null,
                description: null
            });
        };

        $scope.searchContainers = function(qry) {
            var result = [];
            $scope.tint.data.stack[0]['containers'].forEach(function(item) {
                if (item.name.indexOf(qry) == -1) return;

                result.push(item.name);
            });

            return result;
        };

        $scope.removeContainer = function(ev, item) { $scope.remove(ev, item, 'container'); };
        $scope.removeGroup = function(ev, item) { $scope.remove(ev, item, 'group'); };
        $scope.removeView = function(ev, item) { $scope.remove(ev, item, 'view'); };
        $scope.remove = function(ev, item, type) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Would you like to delete the ' + type + '?')
                .content('Are you sure you want to delete the ' + type + ' from the ' + $scope.tint.data.name + ' tint?')
                .ok('Yes')
                .cancel('No')
                .targetEvent(ev);

            var collectionProperty = type + 's';
            var idx = $scope.tint.data.stack[0][collectionProperty].indexOf(item);

            $mdDialog
                .show(confirm)
                .then(function() {
                    if (idx > -1) {
                        $scope.tint.data.stack[0][collectionProperty].splice(idx, 1);
                    }
                });
        };

        $scope.toggleFirmware = function(item, onOrOff) {
            var idx = $scope.tint.data.supported_firmwares.indexOf(item.codename);
            if (idx > -1) $scope.tint.data.supported_firmwares.splice(idx, 1);
            else $scope.tint.data.supported_firmwares.push(item.codename);
        };

        $scope.hasFirmware = function(firmware, onOrOff) {
            if (! $scope.tint) return false;
            return $scope.tint.data.supported_firmwares.indexOf(firmware.codename) > -1;
        };
    }])
    .controller('DesignerCreateDialogController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) {
        $scope.tint = {
            supported_firmwares: [],
            owner: Session.userId
        };

        $scope.firmwares = [
            'genesis',
            'feniks',
            'ember'
        ];

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.save = function() {
            $mdDialog.hide($scope.tint);
        };
    }]);


angular.module('hive.designer', ['hive.designer.controllers', 'hive.library.services', 'ngRoute', 'hive.auth'])
    .config(['$routeProvider', 'USER_ROLES', function($routeProvider, USER_ROLES) {
        $routeProvider
            .when('/designer', {
                templateUrl: 'app/designer/view.html',
                controller: 'DesignerController',
                data: {
                    authorizedRoles: [ USER_ROLES.user ]
                },
                resolve: {
                }
            })
            .when('/designer/:type/:owner/:slug', {
                templateUrl: 'app/designer/design.html',
                controller: 'InternalDesignController',
                data: {
                    authorizedRoles: [ USER_ROLES.user ]
                },
                resolve: {
                    tint: ['$route', 'LibraryService', function($route, LibraryService) {
                        return LibraryService.get(
                            $route.current.params.type,
                            $route.current.params.owner,
                            $route.current.params.slug
                        );
                    }]
                }
            });
    }]);
