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
        $scope.toggleRight();

        //$location.path('/library/' + item.data.type + '/' + item.data.owner + '/' + item.data.slug);
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

    $scope.toggleRight = buildToggler('right');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                });
        },300);
        return debounceFn;
    }

    $scope.search();

}]);

app.controller('LibrarySidebarController', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {
    $scope.close = function() {
        $mdSidenav('right').close()
            .then(function () {

            });
    };
}]);

app.controller('LibraryDetailController', ['$scope', '$location', 'tint', function($scope, $location, tint) {
    $scope.tint = tint;
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