angular.module('hive.library')
    .directive('bbLibraryItemCard', [function() {
        return {
            scope: {
                item: '=bbItem',
                onRemove: '&bbOnRemove',
                onClick: '&bbOnClick'
            },
            templateUrl: 'app/library/cards/library-item-card.tmpl.html',
            controller: ['$scope', 'auth', 'AuthUtils', function($scope, auth, AuthUtils) {
                $scope.isOwner = AuthUtils.isCollaboratorOf(auth, $scope.item);

                $scope.click = function(ev) {
                    if ($scope.onClick)
                        $scope.onClick(ev, $scope.item);
                };

                $scope.remove = function(ev) {
                    if ($scope.onRemove)
                        $scope.onRemove(ev, $scope.item);
                };
            }]
        };
    }]);
