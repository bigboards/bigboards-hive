angular.module('hive.designer.controllers', ['hive.library.services'])
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
            if (! $scope.tint.data.stack) $scope.tint.data.stack = {};
            if (! $scope.tint.data.stack['containers']) $scope.tint.data.stack['containers'] = [];
            if (! $scope.tint.data.stack['groups']) $scope.tint.data.stack['groups'] = [];
            if (! $scope.tint.data.stack['views']) $scope.tint.data.stack['views'] = [];

            $scope.$watch('tint.data', function(newVal, oldVal) {
                if (newVal == oldVal) return;

                saveTint(LibraryService, $mdToast, $scope.tint);
            }, true);
        });




        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.addContainer = function() {
            $scope.tint.data.stack['containers'].push({
                name: null,
                image: null,
                command: null,
                ports: [],
                volumes: [],
                config: {
                    host_path: null,
                    container_path: null
                }
            });
        };

        $scope.addGroup = function() {
            $scope.tint.data.stack['groups'].push({
                name: null,
                runs_on: null,
                containers: []
            });
        };

        $scope.addView = function() {
            $scope.tint.data.stack['views'].push({
                label: null,
                url: null,
                description: null
            });
        };

        $scope.searchContainers = function(qry) {
            var result = [];
            $scope.tint.data.stack['containers'].forEach(function(item) {
                if (item.name.indexOf(qry) == -1) return;

                result.push(item.name);
            });

            return result;
        };

        $scope.createPort = function(ev, item, container) { return  $scope.showPortDialog(ev, 'create', item, container); };
        $scope.editPort = function(ev, item, container, mapping) { return  $scope.showPortDialog(ev, 'edit', item, container, mapping); };
        $scope.showPortDialog = function(ev, action, item, container, mapping) {
            $mdDialog.show({
                controller: 'DesignerContainerPortDialogController',
                templateUrl: '/app/designer/dialogs/port_dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    action: action,
                    mapping: mapping
                }
            })
                .then(function(answer) {
                    if (action == 'create') {
                        container.ports.push(answer);
                    }

                    saveTint(LibraryService, $mdToast, item);
                }, function() {

                });
        };

        $scope.removePort = function(ev, item, container, mapping) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Remove Port Mapping')
                .content('Are you sure you want to remove the port mapping for container port ' + mapping.container + '?')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(ev);

            var idx = container.ports.indexOf(mapping);

            $mdDialog
                .show(confirm)
                .then(function() {
                    if (idx > -1) {
                        container.ports.splice(idx, 1);
                    }
                });
        };

        $scope.createVolume = function(ev, item, container) { return  $scope.showVolumeDialog(ev, 'create', item, container); };
        $scope.editVolume = function(ev, item, container, mapping) { return  $scope.showVolumeDialog(ev, 'edit', item, container, mapping); };
        $scope.showVolumeDialog = function(ev, action, item, container, mapping) {
            $mdDialog.show({
                controller: 'DesignerContainerVolumeDialogController',
                templateUrl: '/app/designer/dialogs/volume_dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    action: action,
                    mapping: mapping
                }
            })
                .then(function(answer) {
                    if (action == 'create') {
                        if (!container.volumes) container.volumes = [];

                        container.volumes.push(answer);
                    }

                    saveTint(LibraryService, $mdToast, item);
                }, function() {

                });
        };
        $scope.removeVolume = function(ev, item, container, mapping) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Remove Volume Mapping')
                .content('Are you sure you want to remove the volume mapping for container volume ' + mapping.container + '?')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(ev);

            var idx = container.volumes.indexOf(mapping);

            $mdDialog
                .show(confirm)
                .then(function() {
                    if (idx > -1) {
                        container.volumes.splice(idx, 1);
                    }
                });
        };

        $scope.createEnvironmentVariable = function(ev, item, container) { return  $scope.showEnvironmentVariableDialog(ev, 'create', item, container); };
        $scope.editEnvironmentVariable = function(ev, item, container, variable) { return  $scope.showEnvironmentVariableDialog(ev, 'edit', item, container, variable); };
        $scope.showEnvironmentVariableDialog = function(ev, action, item, container, variable) {
            $mdDialog.show({
                controller: 'DesignerContainerEnvironmentDialogController',
                templateUrl: '/app/designer/dialogs/environment_dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    action: action,
                    variable: variable
                }
            })
                .then(function(answer) {
                    if (action == 'create') {
                        if (!container.environment) container.environment = [];

                        container.environment.push(answer);
                    }

                    saveTint(LibraryService, $mdToast, item);
                }, function() {

                });
        };
        $scope.removeEnvironmentVariable = function(ev, item, container, variable) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Remove Environment Variable')
                .content('Are you sure you want to remove the environment variable "' + variable.key + '"?')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(ev);

            var idx = container.environment.indexOf(variable);

            $mdDialog
                .show(confirm)
                .then(function() {
                    if (idx > -1) {
                        container.environment.splice(idx, 1);
                    }
                });
        };

        $scope.removeContainer = function(ev, item) { $scope.remove(ev, item, 'container'); };
        $scope.removeGroup = function(ev, item) { $scope.remove(ev, item, 'group'); };
        $scope.removeView = function(ev, item) { $scope.remove(ev, item, 'view'); };
        $scope.remove = function(ev, item, type) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Would you like to delete the ' + type + '?')
                .content('Are you sure you want to delete the ' + type + ' from the ' + $scope.tint.data.name + ' tint?')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);

            var collectionProperty = type + 's';
            var idx = $scope.tint.data.stack[collectionProperty].indexOf(item);

            $mdDialog
                .show(confirm)
                .then(function() {
                    if (idx > -1) {
                        $scope.tint.data.stack[collectionProperty].splice(idx, 1);
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

        function saveTint(LibraryService, $mdToast, tint) {
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
        }
    }])
    .controller('DesignerContainerPortDialogController', ['$scope', '$mdDialog', 'action', 'mapping', function($scope, $mdDialog, action, mapping) {
        $scope.action = action;
        $scope.mapping = mapping;

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.save = function() {
            $mdDialog.hide($scope.mapping);
        };
    }])
    .controller('DesignerContainerVolumeDialogController', ['$scope', '$mdDialog', 'action', 'mapping', function($scope, $mdDialog, action, mapping) {
        $scope.action = action;
        $scope.mapping = mapping;

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.save = function() {
            $mdDialog.hide($scope.mapping);
        };
    }])
    .controller('DesignerContainerEnvironmentDialogController', ['$scope', '$mdDialog', 'action', 'variable', function($scope, $mdDialog, action, variable) {
        $scope.action = action;
        $scope.variable = variable;

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.save = function() {
            $mdDialog.hide($scope.variable);
        };
    }]);


angular.module('hive.designer', ['hive.designer.controllers', 'hive.library.services', 'ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/designer', {
                templateUrl: 'app/designer/view.html',
                controller: 'DesignerController',
                requiresLogin: true
            })
            .when('/designer/:type/:owner/:slug', {
                templateUrl: 'app/designer/design.html',
                controller: 'InternalDesignController',
                requiresLogin: true,
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
