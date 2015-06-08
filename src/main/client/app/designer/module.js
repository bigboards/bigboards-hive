app.controller('DesignerController', ['$scope', '$location', 'Session', function($scope, $location, Session) {

}]);

app.controller('DesignerCreateController', ['$scope', '$location', 'Session', function($scope, $location, Session) {
    var previous = null;
    var selected = null;

    $scope.tint = {
        supported_firmwares: []
    };

    $scope.firmwares = [
        'genesis',
        'feniks',
        'ember'
    ];

    $scope.selectedIndex = 0;
    $scope.tabs = [
        {label: 'General', include: 'app/designer/create-general.html'}
    ];

    $scope.$watch('selectedIndex', function (current, old) {
        previous = selected;
        selected = $scope.tabs[current];
    });

    $scope.$watch('tint.type', function(current, old) {
        if (!current) return;

        if ($scope.tabs.length > 1) $scope.tabs.pop();

        $scope.tabs.push({ label: current, include: 'app/designer/create-' + current + '.html'});
    });

    $scope.toggleFirmware = function(item, onOrOff) {
        var idx = $scope.tint.supported_firmwares.indexOf(item);
        if (idx > -1) $scope.tint.supported_firmwares.splice(idx, 1);
        else $scope.tint.supported_firmwares.push(item);
    };

    $scope.hasFirmware = function(firmware, onOrOff) {
        return $scope.tint.supported_firmwares.indexOf(firmware) > -1;
    };
}]);

app.controller('NewStackController', ['$scope', '$location', 'Session', function($scope, $location, Session) {
    $scope.containers = [];
    $scope.groups = [];
    $scope.views = [];

    $scope.addingContainer = false;
    $scope.addingGroup = false;
    $scope.addingView = false;

    $scope.container = {
        name: null,
        image: null,
        command: null,
        ports: [],
        config: {
            host_path: null,
            container_path: null
        }
    };

    $scope.group = {
        name: null,
        runs_on: null,
        containers: []
    };

    $scope.views = {
        label: null,
        url: null,
        description: null
    };

    $scope.$watch('addingContainer', function(newValue) {
        if (newValue) {
            $scope.newContainer();
        }
    });

    $scope.newContainer = function() {
        $scope.container = {
            name: null,
            image: null,
            command: null,
            ports: [],
            config: {
                host_path: null,
                container_path: null
            }
        };
    };

    $scope.newGroup = function() {
        $scope.group = {
            name: null,
            runs_on: null,
            containers: []
        };
    };

    $scope.newView = function() {
        $scope.view = {
            label: null,
            url: null,
            description: null
        };
    };

    $scope.submitForm = function() {

    }
}]);

