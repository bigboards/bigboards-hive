angular.module('hive.stack')
    .controller('StackListController', StackListController);

StackListController.$inject = [ '$location', '$mdToast', '$mdDialog', 'StackService', 'auth', 'AuthUtils' ];

function StackListController($location, $mdToast, $mdDialog, StackService, auth, AuthUtils) {
    var vm = this;

    vm.loading = true;
    vm.can = {
        add: AuthUtils.isAllowed(auth, 'stack', 'create'),
        edit: AuthUtils.isAllowed(auth, 'stack', 'patch'),
        remove: AuthUtils.isAllowed(auth, 'stack', 'remove')
    };

    vm.add = addStack;
    vm.select = selectStack;
    vm.removeStack = removeStack;

    StackService.list().then(function(response) {
        vm.stacks = response.hits;
        vm.loading = false;
    });

    function addStack(ev) {
        $mdDialog.show({
                controller: 'AddStackDialogController',
                controllerAs: 'vm',
                templateUrl: '/app/stack/add-stack.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: { }
            })
            .then(function(model) {
                StackService.add(model).then(
                    okToastFn('Added!'),
                    failToastFn('Unable to add the stack')
                ).then(function() {
                    if (! vm.stacks) vm.stacks = [];
                    vm.stacks.push({id: model.id, type: 'stack', data: model});

                    //select(model);
                });
            });
    }

    function selectStack(stack) {
        var id = (stack.data.profile.id) ? stack.data.profile.id : stack.data.profile;

        $location.path('/stacks/' + id + '/' + stack.data.slug);
    }

    function removeStack(ev, stack) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to delete the ' + stack.data.name + ' stack?')
            .ariaLabel('Remove Stack')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
            StackService.remove(stack.id).then(
                okToastFn("Removed!"),
                failToastFn("Unable to remove the stack!")
            ).then(function() {
                var idx = vm.stacks.indexOf(stack);
                vm.stacks.splice(idx, 1);
            });
        });
    }

    function okToastFn(message) {
        return function(data) {
            $mdToast.show($mdToast.simple()
                .content(message)
                .position('bottom left')
                .hideDelay(1000));

            return data;
        }
    }

    function failToastFn(message) {
        return function(data) {
            $mdToast.show($mdToast.simple()
                .content(message)
                .position('bottom left')
                .hideDelay(3000));

            return data;
        }
    }
}