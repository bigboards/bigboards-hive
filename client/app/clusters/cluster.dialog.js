angular.module('hive.clusters')
    .controller('ClusterDialogController', ClusterDialogController);

ClusterDialogController.$inject = ['$mdDialog', '$http', '$q', 'ClusterService'];

function ClusterDialogController($mdDialog, $http, $q, ClusterService) {
    var vm = this;

    vm.model = {};
    vm.response = null;
    vm.error = null;

    vm.stage = "/app/clusters/partials/pair.tmpl.html";

    vm.cancel = cancel;
    vm.pair = pair;

    function cancel() {
        $mdDialog.cancel();
    }

    function pair() {
        vm.status = {
            level: "info",
            message: "Retrieving cluster for code ...",
            detail: "I am trying to match the code you provided with a cluster that has registered recently."
        };

        return ClusterService.pair(vm.model.code)
            .then(function(response) {
                vm.response = response;
                vm.status = {
                    level: "info",
                    message: "Contacting the cluster ...",
                    detail: "I am connecting to the cluster to let it know pairing was a success."
                };

                return $http.post(response.cluster.data.callback, {token: response.token})
                    .success(function(data) {
                        $mdDialog.hide(response.cluster);
                        return ClusterService.notifiedOfPairing(response.cluster.id);
                    })
                    .error(function(error) {
                        vm.stage = "/app/clusters/partials/notify_failed.tmpl.html";
                        vm.error = error;
                    }).$promise;

            }, function(error) {
                vm.stage = "/app/clusters/partials/pair_failed.tmpl.html";
                vm.error = error;
            });
    }
}
