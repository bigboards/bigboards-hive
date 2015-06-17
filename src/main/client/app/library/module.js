app.controller('LibraryController', ['$scope', '$location', '$mdDialog', '$mdToast', '$mdUtil', 'Library', 'Session', function($scope, $location, $mdDialog, $mdToast, $mdUtil, Library, Session) {
    $scope.items = [];
    $scope.currentItem = null;

    $scope.filter = {
        type: 'stack',
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

    $scope.iAmOwner = function() {
        if (! Session.user) return false;
        return (Session.user.username == $scope.currentItem.data.owner);
    };

    $scope.newTint = function(ev) {
        var dialog = {
            controller: 'LibraryCreateDialogController',
            templateUrl: 'app/library/dialogs/create.html',
            parent: angular.element(document.body),
            targetEvent: ev
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

    $scope.newStackComponent = function(ev, type) {
        var dialog = {
            controller: 'CreateStackComponentDialogController',
            templateUrl: 'app/library/dialogs/' + type + '.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                type: type
            }
        };

        $mdDialog
            .show(dialog)
            .then(function(item) {
                return $scope.persist(type, item);
            });
    };

    $scope.persist = function(type, entity) {
        var collectionProperty = type + 's';

        if (! $scope.tint.data.stack) $scope.tint.data.stack = [];
        if ($scope.tint.data.stack.length == 0) $scope.tint.data.stack.push({});
        if (! $scope.tint.data.stack[0][collectionProperty]) $scope.tint.data.stack[0][collectionProperty] = [];
        $scope.tint.data.stack[0][collectionProperty].push(entity);

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

app.controller('LibraryCreateDialogController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) {
    $scope.tint = {
        supported_firmwares: [],
        owner: Session.user.username
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

app.controller('CreateStackComponentDialogController', ['$scope', '$mdDialog', 'Session', 'type', function($scope, $mdDialog, Session, type) {
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

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.save = function() {
        $mdDialog.hide($scope.item);
    };
}]);