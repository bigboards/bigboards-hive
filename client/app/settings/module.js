app.controller('SettingsController', ['$scope', function($scope) {
    var previous = null;
    var selected = null;

    $scope.selectedIndex = 0;
    $scope.tabs = [
        { label: 'Profile', include: 'app/settings/profile.html'}
    ];

    $scope.$watch('selectedIndex', function(current, old){
        previous = selected;
        selected = $scope.tabs[current];
    });
}]);

app.controller('SettingsProfileController', ['$scope', '$timeout', 'People', 'Session', function($scope, $timeout, People, Session) {
    Session.currentUser().then(function(user) {
        People.get({username: user.username}).$promise.then(function(person) {
            $scope.person = person.data;
            $scope.$watch('person', debounceUpdate, true);
        });
    });

    // --- autosave every second when form is in edit mode and model has changed ---
    var timeout = null;
    $scope.savePerson = function() {
        People.save({username: $scope.person.username}, $scope.person).$promise.then(function(data) {
            Session.updateUser(data.data);
        });
    };

    var debounceUpdate = function(newVal, oldVal) {
        if ($scope.person && !$scope.person.$invalid && newVal != oldVal) {
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout($scope.savePerson, 1000);
        }
    };
}]);