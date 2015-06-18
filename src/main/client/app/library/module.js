app.controller('LibraryController', ['$scope', '$location', '$mdDialog', '$mdToast', '$mdUtil', 'Library', 'Session', function($scope, $location, $mdDialog, $mdToast, $mdUtil, Library, Session) {
    $scope.items = [];
    $scope.currentItem = null;

    $scope.filter = {
        type: 'stack',
        owner: null,
        architecture: 'all',
        firmware: 'ember',
        q: null
    };

    $scope.firmwares = [
        {value: 'genesis', label: 'Genesis'},
        {value: 'feniks', label: 'Feniks'},
        {value: 'ember', label: 'Ember'}
    ];

    $scope.architectures = [
        {value: 'all', label: 'All'},
        {value: 'armv7l', label: 'armv7l'},
        {value: 'x86_64', label: 'x86_64'}
    ];

    $scope.search = function() {
        Library.search($scope.filter).$promise.then(function(results) {
            $scope.items = results.data;
        });
    };

    $scope.goto = function(item) {
        $location.path('/library/' + item.data.type + '/' + item.data.owner + '/' + item.data.slug);
    };

    $scope.iAmOwner = function() {
        if (! Session.user) return false;
        return (Session.user.username == $scope.currentItem.data.owner);
    };

    $scope.newTint = function(ev) {
        var dialog = {
            controller: 'LibraryItemDialogController',
            templateUrl: 'app/library/dialogs/item.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                tint: {
                    supported_firmwares: [],
                    owner: Session.user.username
                }
            }
        };

        $mdDialog
            .show(dialog)
            .then(function(tint) {
                // -- create the tint in the backend
                Library
                    .add({}, tint).$promise
                    .then(function(data) {
                        console.log('Saved!');
                        $scope.items.push(data);

                        $mdToast.show(
                            $mdToast.simple()
                                .content('The tint has been created')
                                .position('top right')
                                .hideDelay(3000)
                        );
                    }, function(error) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Creating the tint failed. Please do try again.')
                                .position('top right')
                                .hideDelay(3000)
                        );
                    });
            });
    };

    $scope.removeTint = function(ev) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to delete the tint?')
            .content('Are you sure you want to delete the ' + $scope.currentItem.data.name + ' tint?')
            .ok('Yes')
            .cancel('No')
            .targetEvent(ev);

        $mdDialog
            .show(confirm)
            .then(function() {
                Library
                    .remove({type: $scope.currentItem.data.type, owner: $scope.currentItem.data.owner, slug: $scope.currentItem.data.slug }).$promise
                    .then(function(data) {
                        var idx = $scope.items.indexOf($scope.currentItem);
                        if (idx > -1) $scope.items.splice(idx, 1);

                        $scope.currentItem = null;
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

}]);

app.controller('LibrarySidebarController', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {

}]);

app.controller('LibraryDetailController', ['$scope', '$location', '$mdDialog', '$mdToast', 'tint', 'Library', 'Session', function($scope, $location, $mdDialog, $mdToast, tint, Library, Session) {
    $scope.tint = tint;

    $scope.iAmOwner = function() {
        if (! Session.user || !$scope.tint.data) return false;
        return (Session.user.username == $scope.tint.data.owner);
    };

    $scope.editLibraryItem = function(ev) {
        var dialog = {
            controller: 'LibraryItemDialogController',
            templateUrl: 'app/library/dialogs/item.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                tint: $scope.tint.data
            }
        };

        $mdDialog
            .show(dialog)
            .then(function(tint) {
                $scope.tint = tint;
                $scope.persist();
            });
    };

    $scope.editStackComponent = function(ev, type, item) {
        var dialog = {
            controller: 'CreateStackComponentDialogController',
            templateUrl: 'app/library/dialogs/' + type + '.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                type: type,
                item: item
            }
        };

        var mode = (!item) ? 'create' : 'edit';
        var collectionProperty = type + 's';
        if (! $scope.tint.data.stack) $scope.tint.data.stack = [];
        if ($scope.tint.data.stack.length == 0) $scope.tint.data.stack.push({});
        if (! $scope.tint.data.stack[0][collectionProperty]) $scope.tint.data.stack[0][collectionProperty] = [];
        var idx = $scope.tint.data.stack[0][collectionProperty].indexOf(item);

        $mdDialog
            .show(dialog)
            .then(function(item) {
                if (mode == 'create') {
                    $scope.tint.data.stack[0][collectionProperty].push(item);
                } else {
                    $scope.tint.data.stack[0][collectionProperty][idx] = item;
                }

                return $scope.persist();
            });
    };

    $scope.removeStackComponent = function(ev, type, item) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to delete the tint?')
            .content('Are you sure you want to delete the ' + $scope.tint.data.name + ' tint?')
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

                    return $scope.persist();
                }
            });
    };

    $scope.persist = function() {
        // -- create the tint in the backend
        return Library
            .update({type: $scope.tint.data.type, owner: $scope.tint.data.owner, slug: $scope.tint.data.slug}, $scope.tint.data).$promise
            .then(function(data) {
                console.log('Saved!');
                $scope.tint = data;

                $mdToast.show(
                    $mdToast.simple()
                        .content('The changes to the tint have been saved')
                        .position('top right')
                        .hideDelay(3000)
                );
            }, function(error) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Saving the tint failed. Please do try again.')
                        .position('top right')
                        .hideDelay(3000)
                );
            });
    };

    $scope.removeTint = function(ev) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to delete the tint?')
            .content('Are you sure you want to delete the ' + $scope.tint.data.name + ' tint?')
            .ok('Yes')
            .cancel('No')
            .targetEvent(ev);

        $mdDialog
            .show(confirm)
            .then(function() {
                Library
                    .remove({type: $scope.tint.data.type, owner: $scope.tint.data.owner, slug: $scope.tint.data.slug }).$promise
                    .then(function(data) {
                        $location.path('/library');

                        $mdToast.show(
                            $mdToast.simple()
                                .content('The tint has been removed')
                                .position('top right')
                                .hideDelay(3000)
                        );
                    });
            });
    };
}]);

app.controller('LibraryItemDialogController', ['$scope', '$mdDialog', 'Session', 'tint', function($scope, $mdDialog, Session, tint) {
    $scope.tint = tint;

    $scope.firmwares = [
        'genesis',
        'feniks',
        'ember'
    ];

    $scope.toggleFirmware = function(item, onOrOff) {
        var idx = $scope.tint.supported_firmwares.indexOf(item);
        if (idx > -1) $scope.tint.supported_firmwares.splice(idx, 1);
        else $scope.tint.supported_firmwares.push(item);
    };

    $scope.hasFirmware = function(firmware, onOrOff) {
        return $scope.tint.supported_firmwares.indexOf(firmware) > -1;
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.save = function() {
        $mdDialog.hide($scope.tint);
    };
}]);

app.controller('CreateStackComponentDialogController', ['$scope', '$mdDialog', 'Session', 'type', 'item', function($scope, $mdDialog, Session, type, item) {
    if (!item) {
        $scope.mode = 'create';

        if (type == 'container') {
            $scope.item = {
                ports: []
            }
        } else if (type == 'group') {
            $scope.item = {
                containers: []
            }
        } else {
            $scope.item = {};
        }
    } else {
        $scope.mode = 'edit';
        $scope.item = item;
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.save = function() {
        $mdDialog.hide($scope.item);
    };
}]);