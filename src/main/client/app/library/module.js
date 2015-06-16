app.controller('LibraryController', ['$scope', '$location', '$mdDialog', '$mdSidenav', '$mdUtil', 'type', 'Library', 'Session', function($scope, $location, $mdDialog, $mdSidenav, $mdUtil, type, Library, Session) {
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
        $mdDialog.show({
            controller: 'LibraryCreateDialogController',
            templateUrl: 'app/library/dialogs/create.html',
            parent: angular.element(document.body),
            targetEvent: ev
        }).then(function(tint) {
            // -- create the tint in the backend
            Library.add({}, tint).$promise.then(function(data) {
                console.log('Saved!');
                $scope.items.push(data);
            });
        }, function() {
            // -- do nothing
        });
    };

    $scope.removeTint = function() {
        Library.remove({
            type: $scope.currentTint.data.type,
            owner: $scope.currentTint.data.owner,
            slug: $scope.currentTint.data.slug
        }).$promise.then(function(data) {
            var idx = $scope.items.indexOf($scope.currentTint);
            if (idx > -1) $scope.items.splice(idx, 1);
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