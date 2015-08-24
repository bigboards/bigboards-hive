app.controller('DesignerController', ['$scope', '$location', '$mdDialog', 'Session', 'Library', function($scope, $location, $mdDialog, Session, Library) {
    $scope.tint = {
        supported_firmwares: [],
        owner: Session.user.username
    };

    $scope.steps = [
        { code: 'basic' },
        { code: 'technical' }
    ];
    $scope.stepIdx = 0;

    $scope.currentStep = function() {
        return $scope.steps[$scope.stepIdx];
    };

    $scope.hasNextStep = function() {
        return $scope.stepIdx < $scope.steps.length - 1;
    };

    $scope.hasPreviousStep = function() {
        return $scope.stepIdx > 0;
    };

    $scope.next = function()  {
        $scope.stepIdx++;
    };

    $scope.previous = function()  {
        $scope.stepIdx--;
    };

    $scope.finish = function() {
        Library.add({}, $scope.tint).$promise.then(function() {
            console.log('Saved!')
        });
    };
}]);

app.controller('BasicStepController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) {

}]);

app.controller('TechnicalStepController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) {
    $scope.firmwares = [
        'genesis',
        'feniks',
        'ember',
        'gemini'
    ];

    $scope.architectures = [
        'all',
        'armv7l',
        'x86_64'
    ];

    $scope.toggleFirmware = function(item, onOrOff) {
        var idx = $scope.tint.supported_firmwares.indexOf(item);
        if (idx > -1) $scope.tint.supported_firmwares.splice(idx, 1);
        else $scope.tint.supported_firmwares.push(item);
    };

    $scope.hasFirmware = function(firmware, onOrOff) {
        return $scope.tint.supported_firmwares.indexOf(firmware) > -1;
    };
}]);

app.controller('DesignerCreateDialogController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) {
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

    $scope.view = {
        label: null,
        url: null,
        description: null
    };

    $scope.$watch('addingContainer', function(newValue) {
        if (newValue) {
            $scope.newContainer();
        }
    });

    $scope.addContainer = function() {
        $scope.containers.push({
            name: null,
            image: null,
            command: null,
            ports: [],
            config: {
                host_path: null,
                container_path: null
            }
        });
    };

    $scope.removeContainer = function(container) {
        var idx = $scope.containers.indexOf(container);
        if (idx > -1) $scope.containers.splice(idx, 1);
    };

    $scope.updateContainer = function(container) {

    };

    $scope.addGroup = function() {
        $scope.groups.push({
            name: null,
            runs_on: null,
            containers: []
        });
    };

    $scope.removeGroup = function(group) {
        var idx = $scope.groups.indexOf(group);
        if (idx > -1) $scope.groups.splice(idx, 1);
    };

    $scope.updateGroup = function(group) {

    };

    $scope.addView = function() {
        $scope.views.push({
            label: null,
            url: null,
            description: null
        });
    };

    $scope.removeView = function(view) {
        var idx = $scope.views.indexOf(view);
        if (idx > -1) $scope.views.splice(idx, 1);
    };

    $scope.updateView = function(view) {

    };
}]);



