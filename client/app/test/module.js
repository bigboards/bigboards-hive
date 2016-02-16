app.controller('TestController', ['$scope', function($scope) {
    $scope.items = [
        { name: "Item 1", qty: 11.1, email: "item1@fgdfd.com"},
        { name: "Item 2", qty: 22.2, email: "item2@fgdfd.com"},
        { name: "Item 3", qty: 33.3, email: "item3@fgdfd.com"},
        { name: "Item 4", qty: 44.4, email: "item4@fgdfd.com"}
    ];

    $scope.addItem = function() {
        $scope.items.push({});
    };

    $scope.removeItem = function(item) {
        var idx = $scope.items.indexOf(item);
        if (idx > -1) {
            $scope.items.splice(idx, 1);
        }
        console.log('item removed');
    };

    $scope.updateItem = function(item) {
        console.log('item updated');
    };

    $scope.change = function() {
        $scope.message = "changed!";
    };
}]);