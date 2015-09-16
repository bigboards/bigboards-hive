app.directive('sidebarMenuItem', function() {
    return {
        scope: {
            caption: '@',
            href: '@',
            iconClass: '@'
        },
        templateUrl: 'app/common/sidebar-menu-item.html'
    };
});

app.directive('bbList', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function($scope) {
        },
        templateUrl: 'app/common/list/list.html'
    };
});

app.directive('bbListHeader', function() {
    return {
        require: '^bbList',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            onAdd: '&'
        },
        controller: function($scope) {
            $scope.add = function() {
                $scope.onAdd();
            };
        },
        link: function(scope, element, attrs, listCtrl) {
            //$(element).find('.bb-action-add').bind('click', function(evt) {
            //    listCtrl.add();
            //});
        },
        templateUrl: 'app/common/list/list-header.html'
    };
});

app.directive('bbListItem', function() {
    return {
        require: '^bbList',
        restrict: 'E',
        transclude: true,
        scope: {
            item: '=',
            allowRemove: '=',
            onRemove: '&',
            headerTemplate: '@'
        },
        controller: function($scope) {
            $scope.editing = false;
            if ($scope.allowRemove == null || $scope.allowRemove == undefined) $scope.allowRemove = true;

            $scope.toggleEditing = function() {
                $scope.editing = !$scope.editing;
            };

            $scope.remove = function(ev) {
                if ($scope.onRemove) $scope.onRemove(ev, $scope.item);
            };
        },
        templateUrl: 'app/common/list/item.html'
    };
});

app.directive('bbMenuToggle', [ '$timeout', function($timeout){
    return {
        scope: {
            section: '='
        },
        templateUrl: 'app/common/menu/menu-toggle.html',
        link: function($scope, $element) {
            var controller = $element.parent().controller();
            $scope.isOpen = function() {
                return controller.isOpen($scope.section);
            };
            $scope.toggle = function() {
                controller.toggleOpen($scope.section);
            };
        }
    };
}]);

app.directive('bbMenu', [function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {

        },
        controller: function($scope) {
            $scope.active = false;

            $scope.toggle = function() {
                $scope.active = !$scope.active;
            }
        },
        templateUrl: 'app/common/menu/menu.html'
    };
}]);

app.directive('bbMenuItem', [function() {
    return {
        scope: {
            section: '='
        },
        templateUrl: 'app/common/menu/menu-item.html',
        link: function ($scope, $element) {
            var controller = $element.parent().controller();

            $scope.focusSection = function () {
                // set flag to be used later when
                // $locationChangeSuccess calls openPage()
                controller.autoFocusContent = true;
            };
        }
    };
}]);