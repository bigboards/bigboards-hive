angular.module('hive.technology')
    .directive('bbTechnologyDetailItem', [function() {
        return {
            scope: {
                item: '=bbItem',
                onClick: '&bbOnClick'
            },
            templateUrl: 'app/technology/technology-detail-item.directive.html',
            controller: ['$scope', 'auth', 'AuthUtils', function($scope, auth, AuthUtils) {
                $scope.$watch('item', function() {
                    if (! $scope.item) return;

                    if ($scope.item.data) {
                        $scope.title = $scope.item.data.version;
                    } else {
                        $scope.title = $scope.item.name;
                    }

                    if ($scope.item.description) {
                        $scope.subTitle = $scope.item.description;
                    }
                });

                $scope.click = function(ev) {
                    if ($scope.onClick)
                        $scope.onClick(ev, $scope.item);
                };
            }]
        };
    }]);
