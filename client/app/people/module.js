app.controller('PeopleViewController', ['$scope', '$timeout', 'context', 'person', 'People', 'Session', function($scope, $timeout, context, person, People, Session) {
    $scope.context = context;

    $scope.editing = (context.mode == 'edit');

    person.$promise.then(function(person) {
        $scope.person = person.data;
    });

    // --- autosave every second when form is in edit mode and model has changed ---
    var timeout = null;
    $scope.savePerson = function() {
        People.save({username: $scope.person.username}, $scope.person).$promise.then(function(data) {
            Session.updateUser(data.data);
        });

        // -- set the address
        //if (!$scope.editForm.member.data.address) $scope.editForm.member.data.address = [];
        //if ($scope.editForm.member.data.address.length > 0) {
        //    $scope.editForm.member.data.address[0] = $scope.editForm.address;
        //} else {
        //    $scope.editForm.member.data.address.push($scope.editForm.address);
        //}
        //
        //API.one('members', Session.getUserId()).customPUT($scope.editForm.member.data).then(function(member) {
        //    $scope.member = member;
        //    $scope.address = (member.data.address && member.data.address.length > 0) ? member.data.address[0] : {};
        //}, function() {
        //    growl.error('Unable to save your profile. Contact tech support.');
        //});
    };

    var debounceUpdate = function(newVal, oldVal) {
        if ($scope.person && !$scope.person.$invalid && newVal != oldVal) {
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout($scope.savePerson, 1000);
        }
    };

    $scope.$watch('person', debounceUpdate, true);
}]);