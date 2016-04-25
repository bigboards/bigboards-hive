angular.module('hive').factory('Collaborators', Collaborators);

Collaborators.$inject = ['Dialogs', '$mdToast'];

function Collaborators(Dialogs, $mdToast) {
    return {
        add: handleAdd,
        remove: handleRemove
    };

    function handleAdd(ev, promise, entity) {
        return Dialogs.add(
            ev, 'AddCollaboratorDialogController', '/app/core/collaborator/add-collaborator.dialog.html', {}
        ).then(function(result) {
            var model = {
                profile: result.profile.id,
                permissions: result.permissions
            };

            return promise(model)
                .then(function() {
                    if (! entity.collaborators) entity.collaborators = [];
                    entity.collaborators.push({
                        profile: result.profile.data,
                        permissions: result.permissions
                    });
                })
                .then(okToastFn('Added!'), failToastFn('Unable to add ' + result.name + ' as a collaborator'))
        });
    }

    function handleRemove(ev, promise, entity, collaborator) {
        var name = collaborator.profile && collaborator.profile.name ? collaborator.profile.name : collaborator.profile;

        return Dialogs.remove(ev, 'Would you like to remove ' + name + ' from the collaborator list?', 'Remove Collaborator').then(function() {
            return promise();
        }).then(function() {
            if (! entity.collaborators) entity.collaborators = [];

            var idx = entity.collaborators.indexOf(collaborator);
            if (idx != -1) entity.collaborators.splice(idx);
        }).then(okToastFn("Removed!"), failToastFn('Unable to remove ' + collaborator.name + ' from the list of collaborators'));
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
