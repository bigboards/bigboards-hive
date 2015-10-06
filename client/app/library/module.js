angular.module('hive.library.resources', ['ngResource'])
    .factory('LibraryResource', ['$resource', 'settings', function($resource, settings) {
        return $resource(
            settings.api + '/api/v1/library/:type/:owner/:slug',
            { type: '@type', owner: '@owner', slug: '@slug' },
            {
                'search': { method: 'GET', isArray: false, params: { type: null, owner: null, slug: null } },
                'get': { method: 'GET', isArray: false},
                'add': { method: 'POST', params: {type: null, owner: null, slug: null} },
                'update': { method: 'POST' },
                'remove': { method: 'DELETE' }
            });
    }]);

angular.module('hive.library.services', ['hive.library.resources'])
    .factory('LibraryService', ['LibraryResource', function(LibraryResource) {
        var LibraryService = function() { };

        LibraryService.prototype.search = function(filter, offset, size) {
            if (offset) filter.offset = offset;
            if (size) filter.size = size;

            return LibraryResource.search(filter);
        };

        LibraryService.prototype.get = function(type, owner, slug) {
            return LibraryResource.get({type: type, owner: owner, slug: slug});
        };

        LibraryService.prototype.add = function(data) {
            return LibraryResource.add({}, data);
        };

        LibraryService.prototype.remove = function(type, owner, slug) {
            return LibraryResource.remove({type: type, owner: owner, slug: slug });
        };

        LibraryService.prototype.update = function(type, owner, slug, data) {
            return LibraryResource.update({type: type, owner: owner, slug: slug }, data);
        };

        return new LibraryService();
    }]);

angular.module('hive.library.controllers', ['hive.library.services', 'ngMaterial', 'ngRoute'])
    .controller('LibraryController', ['$scope', '$location', '$mdDialog', '$mdToast', '$mdUtil', '$routeParams', 'LibraryService', 'AuthService', 'Session', function($scope, $location, $mdDialog, $mdToast, $mdUtil, $routeParams, LibraryService, AuthService, Session) {
        $scope.columnCount = 2;
        $scope.items = [];
        $scope.isLoggedIn = AuthService.isAuthenticated();

        AuthService.whenLoggedIn(function(user) {
            $scope.isLoggedIn = true;

            $scope.filter.scope = 'private';
            $scope.filter.o = Session.userId;

            LibraryService.search($scope.filter).$promise.then(function (results) {
                $scope.myColumns = partition(results.data, $scope.columnCount, 1);
            });
        });

        AuthService.whenLoggedOut(function() {
            $scope.isLoggedIn = false;
        });

        $scope.filter = {
            t: $routeParams.type ? $routeParams.type : null,
            o: $routeParams.owner ? $routeParams.owner : null,
            architecture: $routeParams.architecture ? $routeParams.architecture : 'all',
            firmware: $routeParams.firmware ? $routeParams.firmware : null,
            q: $routeParams.q ? $routeParams.q : null
        };

        $scope.search = function() {
            $scope.filter = {
                t: $routeParams.type ? $routeParams.type : null,
                o: $routeParams.owner ? $routeParams.owner : null,
                architecture: $routeParams.architecture ? $routeParams.architecture : 'all',
                firmware: $routeParams.firmware ? $routeParams.firmware : null,
                q: $routeParams.q ? $routeParams.q : null,
                scope: 'public'
            };

            LibraryService.search($scope.filter).$promise.then(function(results) {
                $scope.items = results.data;
                $scope.allColumns = partition(results.data, $scope.columnCount, 0);
            });

            if (AuthService.isAuthenticated()) {
                $scope.filter.scope = 'private';
                $scope.filter.owner = Session.userId;

                LibraryService.search($scope.filter).$promise.then(function (results) {
                    $scope.myColumns = partition(results.data, $scope.columnCount, 1);
                });
            }
        };

        $scope.goto = function(ev, item) {
            $location.path('/library/' + item.data.type + '/' + item.data.owner.username + '/' + item.data.slug);
        };

        $scope.removeTint = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Would you like to delete the tint?')
                .content('Are you sure you want to delete the ' + item.data.name + ' tint?')
                .ok('Yes')
                .cancel('No')
                .targetEvent(ev);

            $mdDialog
                .show(confirm)
                .then(function() {
                    LibraryService
                        .remove(item.data.type, item.data.owner, item.data.slug).$promise
                        .then(function(data) {
                            var idx = $scope.items.indexOf(item);
                            if (idx > -1) $scope.items.splice(idx, 1);

                            $mdToast.show(
                                $mdToast.simple()
                                    .content('The tint has been removed')
                                    .position('top right')
                                    .hideDelay(3000)
                            );
                        });
                });
        };

        $scope.search();

        function partition(input, columnCount, offset) {
            var newArr = [];

            // --  construct the column arrays
            for (var col = 0; col < columnCount; col++) newArr.push([]);

            // -- partition the items
            for (var i = 0; i < input.length; i++) {
                var column = ((offset + i) % columnCount);

                newArr[column].push(input[i]);
            }

            return newArr;
        }
    }])
    .controller('LibraryDetailController', ['$scope', '$location', '$mdDialog', '$mdToast', 'tint', 'Session', function($scope, $location, $mdDialog, $mdToast, tint, Session) {
        $scope.tint = tint;

        $scope.iAmOwner = function() {
            if (! Session.user || !$scope.tint.data) return false;
            return (Session.user.username == $scope.tint.data.owner);
        };
    }]);

angular.module('hive.library.directives', [])
    .directive('bbLibraryItemCard', [function() {
        return {
            scope: {
                item: '=bbItem',
                onRemove: '&bbOnRemove',
                onClick: '&bbOnClick'
            },
            templateUrl: 'app/library/cards/library-item-card.tmpl.html',
            controller: ['$scope', 'AuthService', function($scope, AuthService) {
                $scope.isOwner = AuthService.isOwner($scope.item);

                $scope.click = function(ev) {
                    if ($scope.onClick)
                        $scope.onClick(ev, $scope.item);
                };

                $scope.remove = function(ev) {
                    if ($scope.onRemove)
                        $scope.onRemove(ev, $scope.item);
                };
            }]
        };
    }]);

angular.module('hive.library', ['hive.library.controllers', 'hive.library.directives', 'ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/library', {
                title: 'Library',
                templateUrl: 'app/library/view.html',
                controller: 'LibraryController'
            })
            .when('/library/:type/:owner/:slug', {
                title: 'Library',
                templateUrl: 'app/library/detail.html',
                controller: 'LibraryDetailController',
                resolve: {
                    tint: ['$route', 'LibraryService', function($route, LibraryService) {
                        return LibraryService.get($route.current.params.type, $route.current.params.owner, $route.current.params.slug);
                    }]
                }
            })
    }]);