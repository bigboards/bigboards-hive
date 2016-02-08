angular.module('hive.technology')
    .directive('bbTechnologyItem', [function() {
        return {
            scope: {
                item: '=bbItem',
                onClick: '&bbOnClick'
            },
            templateUrl: 'app/technology/technology-item.directive.html',
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
