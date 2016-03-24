angular.module('hive').factory('Dialogs', Dialogs);

Dialogs.$inject = ['$mdDialog', 'Feedback'];

function Dialogs($mdDialog, Feedback) {
    return {
        add: addDialog,
        edit: addDialog,
        remove: removeDialog
    };

    function addDialog(ev, controller, template, model) {
        return $mdDialog.show({
            controller: controller,
            controllerAs: 'vm',
            templateUrl: template,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                model: model
            }
        });
    }

    function removeDialog(ev, title, label) {
        var confirm = $mdDialog.confirm()
            .title(title)
            .ariaLabel(label)
            .targetEvent(ev)
            .ok('Remove')
            .cancel('Cancel');

        return $mdDialog.show(confirm);
    }

    function capitalize(str) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    function decapitalize(str) {
        return str.substr(0, 1).toLowerCase() + str.substr(1);
    }
}
