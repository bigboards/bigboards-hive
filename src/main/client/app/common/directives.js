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
            onUpdate: '&',
            onRemove: '&'
        },
        controller: function($scope) {
            $scope.editing = false;
            $scope.editor = null;
            $scope.renderer = null;

            $scope.startEditing = function() {
                $scope.editing = true;
            };

            $scope.cancel = function() {
                $scope.editing = false;
            };

            $scope.save = function() {
                $scope.editing = false;
                $scope.onUpdate();
            };

            $scope.remove = function() {
                $scope.onRemove();
            };

            $scope.$watch('editing', function(newVal) {
                if ($scope.renderer) $scope.renderer.visible = !newVal;
                if ($scope.editor) $scope.editor.visible = newVal;
            });

            this.setRenderer = function(renderer) {
                $scope.renderer = renderer;
                renderer.item = $scope.item;
                renderer.visible = true;
            };

            this.setEditor = function(editor) {
                $scope.editor = editor;
            };
        },
        templateUrl: 'app/common/list/item.html'
    };
});

app.directive('bbItemRenderer', function() {
    return {
        require: '^bbListItem',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {},
        link: function(scope, element, attrs, itemCtrl) {
            itemCtrl.setRenderer(scope);
        },
        templateUrl: 'app/common/list/item-renderer.html'
    };
});

app.directive('bbItemEditor', function() {
    return {
        require: '^bbListItem',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {},
        link: function(scope, element, attrs, itemCtrl) {
            itemCtrl.setEditor(scope);
        },
        templateUrl: 'app/common/list/item-editor.html'
    };
});