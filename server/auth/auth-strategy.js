var Q = require('q');

module.exports = {
    check: check
};

function check(entity, requesterId, requestedType, requestedOperation) {
    // -- making modifucations requires the user to be authenticated
    if (isModifyingOperation(requestedOperation) && !requesterId) return Q.reject(new OperationNotAllowed('Authentication is required to ' + requestedOperation + ' a ' + requestedType));

    // -- if there is a scope and it is set to public, we will do no more validationss
    if (entity.scope && entity.scope == 'public') return Q();

    // -- the profile owning the document always has all the rights
    if (entity.profile && entity.profile == requesterId) return Q();

    // -- check the list of collaborators
    if (entity.collaborators) {
        var collaboratorMatchingRequester = null;
        entity.collaborators.forEach(function(collaborator) {
            if (collaborator.profile == requesterId)
                collaboratorMatchingRequester = collaborator;
        });

        if (collaboratorMatchingRequester) {
            // -- check if the requester operation is inside the list of permissions
            if (collaboratorMatchingRequester.permissions.indexOf('*') != -1) return Q();
            if (collaboratorMatchingRequester.permissions.indexOf(requestedOperation) != -1) return Q();
        }
    }

    return Q.reject(new OperationNotAllowed('Insufficient rights.'));
}

function isModifyingOperation(operation) {
    return ['delete', 'remove', 'add', 'update', 'patch'].indexOf(operation) != -1;
}

function OperationNotAllowed(message) {
    this.name = "OperationNotAllowed";
    this.message = message;
    this.stack = Error().stack;
}
OperationNotAllowed.prototype = Object.create(Error.prototype);
module.exports.OperationNotAllowed = OperationNotAllowed;