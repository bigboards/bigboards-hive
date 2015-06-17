app.controller('LibraryController', ['$scope', '$location', '$mdDialog', '$mdToast', '$mdUtil', 'type', 'Library', 'Session', function($scope, $location, $mdDialog, $mdToast, $mdUtil, type, Library, Session) {
    $scope.items = [];
    $scope.currentItem = null;

    $scope.filter = {
        type: type,
        owner: null,
        q: null
    };

    $scope.search = function() {
        Library.search($scope.filter).$promise.then(function(results) {
            $scope.items = results.data;
        });
    };

    $scope.goto = function(item) {
        $scope.currentItem = item;

        //$location.path('/library/' + item.data.type + '/' + item.data.owner + '/' + item.data.slug);
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
                $scope.alert = 'You decided to get rid of your debt.';

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

app.controller('LibraryDetailController', ['$scope', '$location', 'tint', 'Library', function($scope, $location, tint, Library) {
    $scope.tint = tint;

    $scope.removeTint = function() {

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