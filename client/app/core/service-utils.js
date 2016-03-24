angular.module('hive').factory('ServiceUtils', ServiceUtils);

ServiceUtils.$inject = ['Dialogs', '$mdToast'];

function ServiceUtils(Dialogs, $mdToast) {
    return {
        handleAdd: handleAdd
    };

    function handleAdd(ev, promise, entityName, collection, entityData) {
        return Dialogs.add(
            ev, 'AddCollaboratorDialogController', '/app/core/collaborator/add-collaborator.dialog.html', {}
        ).then(promise).then(
            okToastFn('Added!').then(function() {
                if (! collection) collection = [];
                collection.push(entityData);
            }),
            failToastFn('Unable to add the ' + entityName)
        );
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
