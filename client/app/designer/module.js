app.controller('DesignerController', ['$scope', '$location', '$mdToast', '$window', 'Session', 'Library', function($scope, $location, $mdToast, $window, Session, Library) {
    $scope.tint = {
        supported_firmwares: [],
        owner: Session.user.username
    };

    $scope.steps = [
        { code: 'basic' }
    ];
    $scope.stepIdx = 0;

    $scope.currentStep = function() { return $scope.steps[$scope.stepIdx]; };

    $scope.hasNextStep = function() { return $scope.stepIdx < $scope.steps.length - 1; };
    $scope.hasPreviousStep = function() { return $scope.stepIdx > 0; };

    $scope.next = function() { $scope.stepIdx++; };
    $scope.previous = function()  { $scope.stepIdx--; };
    $scope.cancel = function()  { $window.history.back(); };

    $scope.finish = function() {
        Library.add({}, $scope.tint).$promise.then(function(data) {
            $mdToast.show($mdToast.simple()
                .content('The tint has been created')
                .position('top right')
                .hideDelay(3000));

            $location.path('/designer/' + $scope.tint.type + '/' + $scope.tint.owner + '/' + $scope.tint.slug);
        }, function() {
            $mdToast.show($mdToast.simple()
                .content('Creating the tint failed. Please do try again.')
                .position('top right')
                .hideDelay(3000)
            );
        });
    };
}]);

app.controller('BasicStepController', ['$scope', '$mdDialog', 'Session', function($scope, $mdDialog, Session) {

}]);

app.controller('InternalDesignController', ['$scope', 'tint', 'Library', 'Session', '$mdDialog', '$mdToast', 'Firmwares', 'Architectures', function($scope, tint, Library, Session, $mdDialog, $mdToast, Firmwares, Architectures) {
    $scope.firmwares = Firmwares;
    $scope.architectures = Architectures;
    $scope.selectedContainer = null;
    $scope.containerSearchText = null;

    tint.$promise.then(function(response) {
        $scope.tint = response;

        // -- initialize the tint if needed
        if (! $scope.tint.data.stack) $scope.tint.data.stack = [];
        if ($scope.tint.data.stack.length == 0) $scope.tint.data.stack.push({});
        if (! $scope.tint.data.stack[0]['containers']) $scope.tint.data.stack[0]['containers'] = [];
        if (! $scope.tint.data.stack[0]['groups']) $scope.tint.data.stack[0]['groups'] = [];
        if (! $scope.tint.data.stack[0]['views']) $scope.tint.data.stack[0]['views'] = [];

        $scope.$watch('tint.data', function(newVal, oldVal) {
            if (newVal == oldVal) return;

            return Library
                .update({type: $scope.tint.data.type, owner: $scope.tint.data.owner, slug: $scope.tint.data.slug}, $scope.tint.data).$promise
                .then(function(data) { return data; }, function(error) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('Saving the tint failed. Please do try again.')
                            .position('top right')
                            .hideDelay(3000)
                    );
                });
        }, true);
    });


    var originatorEv;
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.addContainer = function() {
        $scope.tint.data.stack[0]['containers'].push({
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

    $scope.addGroup = function() {
        $scope.tint.data.stack[0]['groups'].push({
            name: null,
            runs_on: null,
            containers: []
        });
    };

    $scope.addView = function() {
        $scope.tint.data.stack[0]['views'].push({
            label: null,
            url: null,
            description: null
        });
    };

    $scope.searchContainers = function(qry) {
        var result = [];
        $scope.tint.data.stack[0]['containers'].forEach(function(item) {
            if (item.name.indexOf(qry) == -1) return;

            result.push(item.name);
        });

        return result;
    };

    $scope.removeContainer = function(ev, item) { $scope.remove(ev, item, 'container'); };
    $scope.removeGroup = function(ev, item) { $scope.remove(ev, item, 'group'); };
    $scope.removeView = function(ev, item) { $scope.remove(ev, item, 'view'); };
    $scope.remove = function(ev, item, type) {
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Would you like to delete the ' + type + '?')
            .content('Are you sure you want to delete the ' + type + ' from the ' + $scope.tint.data.name + ' tint?')
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
                }
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

    $scope.toggleFirmware = function(item, onOrOff) {
        var idx = $scope.tint.data.supported_firmwares.indexOf(item.codename);
        if (idx > -1) $scope.tint.data.supported_firmwares.splice(idx, 1);
        else $scope.tint.data.supported_firmwares.push(item.codename);
    };

    $scope.hasFirmware = function(firmware, onOrOff) {
        if (! $scope.tint) return false;
        return $scope.tint.data.supported_firmwares.indexOf(firmware.codename) > -1;
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

